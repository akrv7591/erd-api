import {CallbackDataStatus, Key, MultiplayerServiceActions, WorkerEnum} from "../../../../enums/multiplayer";
import {NODE_TYPES} from "../../../../enums/node-type";
import redisClient from "../../../../redis/multiplayerRedisClient";
import {ErdModel} from "../../../../sequelize-models/erd-api/Erd.model";
import {RelationModel} from "../../../../sequelize-models/erd-api/Relation.model";
import {EntityModel, EntityNode} from "../../../../sequelize-models/erd-api/Entity.model";
import {MemoModel, MemoNode} from "../../../../sequelize-models/erd-api/Memo.mode";
import {ColumnModel} from "../../../../sequelize-models/erd-api/Column.model";
import {SocketReservedEventsMap} from "socket.io/dist/socket";
import {MultiplayerConfig, MultiplayerSocket} from "./type";
import {MultiplayerServices} from "./services";

export class MultiplayerWorker {
  private static instances: Map<MultiplayerSocket, MultiplayerWorker> = new Map()

  static getInstance(socket: MultiplayerSocket): MultiplayerWorker {
    let instance = MultiplayerWorker.instances.get(socket)

    if (!instance) {
      instance = new MultiplayerWorker(socket)
      MultiplayerWorker.instances.set(socket, instance)
    }

    return instance
  }

  private socket: MultiplayerSocket

  constructor(socket: MultiplayerSocket) {
    this.socket = socket

    socket.on("disconnect", this.onDisconnect)
  }

  get config(): MultiplayerConfig {
    const playgroundId = this.socket.handshake.auth['playgroundId']
    const playerId = this.socket.handshake.auth['playerId']
    const playgroundKey = Key.playgrounds + ":" + playgroundId
    const playgroundNodesPattern = playgroundKey + ":" + Key.nodes + ":*"
    const playerRoom = Key.subscribers + ":" + playerId

    return {
      playgroundId,
      playerId,
      playgroundKey,
      playgroundNodesPattern,
      playerRoom,
    }
  }

  nodePositionKey(nodeType: NODE_TYPES, nodeId: string): string {
    return this.config.playgroundKey + ":" + Key.nodes + ":" + nodeType + ":" + nodeId + ":" + Key.position
  }

  nodePositionKeyParsed(key: string): { nodeType: NODE_TYPES, nodeId: string } {
    const parsedKey = key.split(":") as [Key.playgrounds, string, Key.nodes, NODE_TYPES, string, Key.position]

    return {
      nodeType: parsedKey[3],
      nodeId: parsedKey[4],
    }
  }

  private async isInCleaningUpQueue() {
    const key = this.config.playgroundKey + ":" + Key.cleanUpQueue
    return await redisClient.sIsMember(key, this.config.playgroundId)
  }

  private async waitCleaningUpFinish() {
    return new Promise(async (resolve, reject) => {
      const key = this.config.playgroundKey + ":" + Key.cleanUpQueue
      const subscribeClient = redisClient.duplicate()
      await subscribeClient.connect()

      const unsubscribe = async (callback: VoidFunction) => {
        await subscribeClient.unsubscribe(key)
        await subscribeClient.disconnect()
        callback()
      }
      await subscribeClient.subscribe(key, (message) => {
        switch (message) {
          case Key.finish:
            unsubscribe(() => resolve("CLEANING UP QUEUE FINISHED"))
            break
        }
      })

      setTimeout(() => {
        unsubscribe(() => reject("TIMEOUT"))
      }, 50000)
    })
  }

  private async isDepartmentExists() {
    const pattern = this.config.playgroundKey + ":*"
    return await redisClient.keys(pattern).then(keys => keys.length > 0)
  }

  private async getRegistered() {
    const key = this.config.playgroundKey + ":" + Key.players
    return await redisClient.sAdd(key, this.config.playerId)
  }

  private createDepartment = async () => {
    // Set and get entities and memos
    const data = await this.getPlaygroundData()

    await this.setNodesPosition(data.nodes)
  }

  private getPlaygroundData = async () => {
    const [nodes, players, erd, relations] = await Promise.all([
      this.getNodeModels(),
      this.getPlayers().then(this.applyPlayerCursorPositionToPlayers),
      ErdModel.findByPk(this.config.playgroundId).then(e => e?.toJSON()),
      RelationModel.findAll({
        where: {
          erdId: this.config.playgroundId
        }
      })
    ])

    return {
      ...erd,
      players,
      relations,
      nodes,
    }
  }

  private getNodeModels = async (): Promise<any[]> => {
    const [entities, memos] = await Promise.all([
      EntityModel.findAll({
        where: {
          erdId: this.config.playgroundId
        },
        include: [{
          model: ColumnModel,
        }],
        order: [
          ['columns', 'order', 'asc']
        ],
      }).then(entities => entities.map(entity => entity.node())),
      MemoModel.findAll({
        where: {
          erdId: this.config.playgroundId
        }
      }).then(memos => memos.map(memo => memo.node())),
    ])


    return [...entities, ...memos]
  }

  private async getPlayers() {
    const key = this.config.playgroundKey + ":" + Key.players
    return await redisClient.sMembers(key)
  }

  private applyPlayerCursorPositionToPlayers(players: string[]) {
    return players.map(player => ({
      id: player,
      cursorPosition: null
    }))
  }

  private setNodesPosition = async (nodes: (EntityNode | MemoNode)[]) => {
    const nodeKeyValueData: { [key: string]: string } = {}
    nodes.forEach(node => {
      let key = ""
      switch (node.type) {
        case NODE_TYPES.ENTITY:
          key = this.nodePositionKey(NODE_TYPES.ENTITY, node.id)
          break
        case NODE_TYPES.MEMO:
          key = this.nodePositionKey(NODE_TYPES.MEMO, node.id)

      }
      nodeKeyValueData[key] = JSON.stringify(node.position)
    })

    if (Object.keys(nodeKeyValueData).length > 0) {
      await redisClient.mSet(nodeKeyValueData)
    }
  }


  private notifyDepartmentOnWorkerJoin() {
    this.socket.join([this.config.playgroundKey, this.config.playerRoom])
    this.socket.to(this.config.playgroundKey).emit(WorkerEnum.join, {id: this.config.playerId}, this.emmitHandler(WorkerEnum.join))
  }

  async waitInQueue() {
    if (await this.isInCleaningUpQueue()) {
      console.log("WAITING FOR CLEANING UP TO FINISH")
      await this.waitCleaningUpFinish()
    }
  }

  async firstAssignment() {
    const data = await this.getPlaygroundData()

    this.socket.emit(WorkerEnum.data, data, this.emmitHandler(WorkerEnum.data))
  }

  private async removePlayerFromPlayground() {
    try {
      const key = this.config.playgroundKey + ":" + Key.players
      await redisClient.sRem(key, this.config.playerId)
    } catch (e) {
      console.error("removePlayerFromPlayground: ", e)
    }
  }

  private async isPlaygroundEmpty() {
    const key = this.config.playgroundKey + ":" + Key.players
    const players = await redisClient.sMembers(key)
    return players.length === 0
  }

  private async createCleaningUpQueue() {
    const key = this.config.playgroundKey + ":" + Key.cleanUpQueue
    await redisClient.sAdd(key, this.config.playgroundId)
    console.log("PLAYGROUND: " + this.config.playgroundId + " ADDED TO " + "CLEANING UP QUEUE: ")
  }

  private async saveRealtimeNodePositionsToDb() {
    try {
      const keys = await redisClient.keys(this.config.playgroundNodesPattern)

      if (!keys.length) {
        console.log("NO NODES FOUND IN PLAYGROUND: " + this.config.playgroundId)
        return
      }

      const nodePositions = await redisClient.mGet(keys)

      await Promise.all(keys.map((key, i) => {
        const {nodeId, nodeType} = this.nodePositionKeyParsed(key)

        const positionValue = nodePositions[i]

        if (!positionValue) {
          return Promise.resolve()
        }
        const position = JSON.parse(positionValue)

        if (!position) {
          return Promise.resolve()
        }

        switch (nodeType) {
          case NODE_TYPES.ENTITY:
            return EntityModel.update({position}, {
              where: {id: nodeId}
            })
          case NODE_TYPES.MEMO:
            return MemoModel.update({position}, {
              where: {id: nodeId}
            })
        }
      }))
      console.log("NODES SAVED TO DB")

    } catch (e) {
      console.log(e)
    }
  }

  private async removeCleaningUpQueue() {
    const key = this.config.playgroundKey + ":" + Key.cleanUpQueue
    await redisClient.sRem(key, this.config.playgroundId)
    console.log("PLAYGROUND: " + this.config.playgroundId + " REMOVED FROM " + "CLEANING UP QUEUE: ")
  }

  private async publishCleaningUpQueueFinish() {
    const key = this.config.playgroundKey + ":" + Key.cleanUpQueue
    await redisClient.publish(key, Key.finish)
  }

  private async cleanUpRedis() {
    const keys = await redisClient.keys(this.config.playgroundKey + ":*")

    if (!keys.length) {
      return
    }

    const totalDeleted = await redisClient.del(keys)
    console.log(totalDeleted + " KEYS DELETED FROM PLAYGROUND: " + this.config.playgroundId)
  }

  private async handleEmptyPlayground() {
    // Create playground cleaning up event queue
    await this.createCleaningUpQueue()

    // save node positions to db
    await this.saveRealtimeNodePositionsToDb()
    // await this.removeNodePositionsFromPlayground()
    await this.cleanUpRedis()
    await this.removeCleaningUpQueue()
    await this.publishCleaningUpQueueFinish()
  }

  emmitHandler = (action: MultiplayerServiceActions) => (status: CallbackDataStatus) => {
    switch (status) {
      case CallbackDataStatus.FAILED:
        console.error(action, ": " , status)
    }
  }
  startServices() {
    MultiplayerServices.forEach(service => service(this.socket, this.config, this.emmitHandler))
  }

  async register() {
    console.log("CONNECTION: ", this.config.playerId)

    if (await this.isDepartmentExists()) {
      // Wait in queue if there is cleanup actions
      await this.waitInQueue()

    } else {
      await this.createDepartment()
    }

    // Check if player is registered
    await this.getRegistered()

    this.notifyDepartmentOnWorkerJoin()
  }

  onDisconnect: SocketReservedEventsMap['disconnect'] = async (reason, description) => {
    console.log("DISCONNECT: ", {reason, description})

    // Remove player from playground
    await this.removePlayerFromPlayground()

    if (await this.isPlaygroundEmpty()) {
      // Handle empty playground
      await this.handleEmptyPlayground()
    } else {

      // Emit player leave event to other players if playground is not empty
      this.socket.to(this.config.playgroundKey).emit(WorkerEnum.leave, {id: this.config.playerId}, this.emmitHandler(WorkerEnum.leave))
    }
  }
}
