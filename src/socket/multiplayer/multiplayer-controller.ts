import {PlayerController} from "./player-controller";
import {Key, PlayerEnum} from "../../enums/multiplayer";
import {EntityController} from "./entity-controllers";
import {RelationController} from "./relation-controller";
import {ColumnController} from "./column-controller";
import {ErdModel} from "../../sequelize-models/erd-api/Erd.model";
import {RelationModel} from "../../sequelize-models/erd-api/Relation.model";
import {ColumnModel} from "../../sequelize-models/erd-api/Column.model";
import {EntityModel} from "../../sequelize-models/erd-api/Entity.model";
import {ErdController} from "./erd-controller";
import {MemoModel} from "../../sequelize-models/erd-api/Memo.mode";
import {MemoController} from "./memo-controller";
import redisClient from "../../redis/multiplayerRedisClient";
import {NodeController} from "./node-controller";
import {MultiplayerBase} from "../../utils/multiplayerControllerBase";
import {Server, Socket} from "socket.io";
import {NODE_TYPES} from "../../enums/node-type";
import {SocketReservedEventsMap} from "socket.io/dist/socket";

export class MultiplayerController extends MultiplayerBase {
  constructor(io: Server, socket: Socket) {
    super(io, socket);

    this.init()
      .then(() => {
        console.log("MULTIPLAYER CONTROLLER INITIALIZED")
      })
  }
  init = async () => {

    console.log("CONNECTION: ", this.playerId)

    try {
      const isPlaygroundInCleaningUpQueue = await this.isInCleaningUpQueue()

      if (isPlaygroundInCleaningUpQueue) {
        console.log("--WAITING FOR CLEANING UP QUEUE TO FINISH")
        await this.subscribeCleaningUpQueueFinish()
      }

      let data
      // Check if playground exists
      const playgroundExists = await this.isPlaygroundExist()

      // Add player to playground
      await this.addPlayerToPlayground()

      // If not,
      if (!playgroundExists) {
        // Create it
        data = await this.initPlayground()
      } else {
        // Get it
        data = await this.getPlaygroundData()
      }

      this.socket.join([this.playgroundKey, this.playerRoom])
      this.socket.to(this.playgroundKey).emit(PlayerEnum.join, this.playerId)
      this.socket.emit("data", data)

      this.initControllers()

    } catch (e) {
      console.error("GET PLAYGROUND ERROR: ", e)
    }

    this.socket.on("disconnect", this.onDisconnect)

  }

  private async isPlaygroundExist() {
    const pattern = this.playgroundKey + ":*"
    return await redisClient.keys(pattern).then(keys => keys.length > 0)
  }

  private async addPlayerToPlayground() {
    const key = this.playgroundKey + ":" + Key.players
    return await redisClient.sAdd(key, this.playerId)
  }

  private async getPlayers() {
    const key = this.playgroundKey + ":" + Key.players
    return await redisClient.sMembers(key)
  }

  private applyPlayerCursorPositionToPlayers(players: string[]) {
    return players.map(player => ({
      id: player,
      cursorPosition: null
    }))
  }

  private async removePlayerFromPlayground() {
    const key = this.playgroundKey + ":" + Key.players
    const result = await redisClient.sRem(key, this.playerId)

    console.log("PLAYER " + (result? `REMOVED FROM ` : "NO T FOUND IN") + key +  " - " + this.playerId)
  }

  private async isPlaygroundEmpty() {
    const key = this.playgroundKey + ":" + Key.players
    const players = await redisClient.sMembers(key)
    return players.length === 0
  }

  private async handleEmptyPlayground() {
    // Create playground cleaning up event queue
    await this.createCleaningUpQueue()

    // save node positions to db
    await this.saveRealtimeNodePositionsToDb()
    await this.removeNodePositionsFromPlayground()

    // Remove playground from redis
    const result = await redisClient.sRem(Key.playgrounds, this.playgroundId)

    await new Promise(resolve => setTimeout(resolve, 2000))

    await this.removeCleaningUpQueue()
    await this.publishCleaningUpQueueFinish()

    console.log("PLAYGROUND " + (result? `REMOVED FROM ` : "NOT FOUND IN") + Key.playgrounds +  " - " + this.playgroundId)
  }

  private async createCleaningUpQueue() {
    const key = this.playgroundKey + ":" + Key.cleanUpQueue
    await redisClient.sAdd(key, this.playgroundId)
    console.log("PLAYGROUND: " + this.playgroundId + " ADDED TO " + "CLEANING UP QUEUE: ")
  }

  private async removeCleaningUpQueue() {
    const key = this.playgroundKey + ":" + Key.cleanUpQueue
    await redisClient.sRem(key, this.playgroundId)
    console.log("PLAYGROUND: " + this.playgroundId + " REMOVED FROM " + "CLEANING UP QUEUE: ")
  }

  private async isInCleaningUpQueue() {
    const key = this.playgroundKey + ":" + Key.cleanUpQueue
    return await redisClient.sIsMember(key, this.playgroundId)
  }

  private async publishCleaningUpQueueFinish() {
    const key = this.playgroundKey + ":" + Key.cleanUpQueue
    await redisClient.publish(key, Key.finish)
  }

  private async subscribeCleaningUpQueueFinish() {
    return new Promise(async (resolve, reject) => {
      const key = this.playgroundKey + ":" + Key.cleanUpQueue
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
      }, 10000)
    })
  }

  private async removeNodePositionsFromPlayground() {
    const keys = await redisClient.keys(this.playgroundNodesPattern)
    const result = await redisClient.del(keys)

    console.log(keys.length + " NODES " + (result? `REMOVED FROM ` : "NOT FOUND IN") + this.playgroundNodesPattern +  " - " + this.playgroundId)
  }


  private async saveRealtimeNodePositionsToDb() {
    const keys = await redisClient.keys(this.playgroundNodesPattern)
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
            where: { id: nodeId}
          })
        case NODE_TYPES.MEMO:
          return MemoModel.update({position}, {
            where: { id: nodeId}
          })
      }
    }))

    console.log("NODES SAVED TO DB")
  }

  private onDisconnect: SocketReservedEventsMap['disconnect'] = async (reason, description) => {

    console.log(("--PLAYER " + this.playerId + " DISCONNECTED. Reason: " + reason + ". Description: " + description))

    try {

      // Remove player from playground
      await this.removePlayerFromPlayground()

      // Check if playground is empty
      const isPlaygroundEmpty = await this.isPlaygroundEmpty()

      if (isPlaygroundEmpty) {
        // Handle empty playground
        await this.handleEmptyPlayground()
      } else {

        // Emit player leave event to other players if playground is not empty
        this.socket.to(this.playgroundKey).emit(PlayerEnum.leave, this.playerId)
      }

    } catch (e) {
      console.error("SOCKET DISCONNECT ERROR: ", e)
    }
  }

  private initControllers = () => {
    new EntityController(this.io, this.socket)
    new ColumnController(this.io, this.socket)
    new ErdController(this.io, this.socket)
    new MemoController(this.io, this.socket)
    new PlayerController(this.io, this.socket)
    new RelationController(this.io, this.socket)
    new NodeController(this.io, this.socket)
  }

  // Util functions
  private getPlaygroundData = async () => {
    const [nodes, players, erd, relations] = await Promise.all([
      this.getNodeModels(),
      this.getPlayers().then(this.applyPlayerCursorPositionToPlayers),
      ErdModel.findByPk(this.playgroundId).then(e => e?.toJSON()),
      RelationModel.findAll({
        where: {
          erdId: this.playgroundId
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


  private setNodesPosition = async (nodes: (EntityModel | MemoModel)[]) => {
    const nodeKeyValueData: { [key: string]: string } = {}
    nodes.forEach(node => {
      let key = ""
      switch (true) {
        case node instanceof EntityModel:
          key = this.nodePositionKey(NODE_TYPES.ENTITY, node.id)
          break
        case node instanceof MemoModel:
          key = this.nodePositionKey(NODE_TYPES.MEMO, node.id)

      }
      nodeKeyValueData[key] = JSON.stringify(node.position)
    })

    if (Object.keys(nodeKeyValueData).length > 0) {
      await redisClient.mSet(nodeKeyValueData)
    }
  }

  private initPlayground = async () => {
    // Set and get entities and memos
    const data = await this.getPlaygroundData()

    await this.setNodesPosition(data.nodes)

    return data
  }


  private getNodeModels = async (): Promise<(EntityModel | MemoModel)[]> => {
    const [entities, memos] = await Promise.all([
      EntityModel.findAll({
        where: {
          erdId: this.playgroundId
        },
        include: [{
          model: ColumnModel,
        }],
        order: [
          ['columns', 'order', 'asc']
        ],
      }),
      MemoModel.findAll({
        where: {
          erdId: this.playgroundId
        }
      }),
    ])


    return [...entities, ...memos]
  }
}

