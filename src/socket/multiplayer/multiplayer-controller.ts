import {PlayerController} from "./player-controller";
import {Key, PlayerEnum} from "../../enums/multiplayer";
import {EntityController} from "./entity-controllers";
import {RelationController} from "./relation-controller";
import {ColumnController} from "./column-controller";
import {ErdModel} from "../../sequelize-models/erd-api/Erd.model";
import {RelationModel} from "../../sequelize-models/erd-api/Relation.model";
import {ColumnModel} from "../../sequelize-models/erd-api/Column.model";
import {EntityModel, IEntityModel} from "../../sequelize-models/erd-api/Entity.model";
import {ErdController} from "./erd-controller";
import {IMemoModel, MemoModel} from "../../sequelize-models/erd-api/Memo.mode";
import {MemoController} from "./memo-controller";
import redisClient from "../../redis/multiplayerRedisClient";
import {NodeController} from "./node-controller";
import {MultiplayerBase} from "../../utils/multiplayerControllerBase";
import {Server, Socket} from "socket.io";

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
      let data
      // Add player to playground
      await this.addPlayerToPlayground()
      // Check if playground exists
      const playgroundExists = await this.doesPlaygroundExist()


      // If not,
      if (!playgroundExists) {
        // Create it
        await this.addPlayground()

        data = await this.initPlayground()
      } else {
        // Get it
        data = await this.getPlaygroundData()
      }

      const playerRoom = Key.subscribers + ":" + this.playerId

      this.socket.join([this.playgroundKey, playerRoom ])
      this.socket.to(this.playgroundKey).emit(PlayerEnum.join, this.playerId)
      this.socket.emit("data", data)

      this.initControllers()

    } catch (e) {
      console.error("GET PLAYGROUND ERROR: ", e)
    }

    this.socket.on("disconnect", () => this.onDisconnect())

  }

  private async doesPlaygroundExist() {
    return await redisClient.sIsMember(Key.playgrounds, this.playgroundId)
  }

  private async addPlayground() {
    await redisClient.sAdd(Key.playgrounds, this.playgroundId)
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
    return await redisClient.sRem(key, this.playerId)
  }

  private async isPlaygroundEmpty() {
    const key = this.playgroundKey + ":" + Key.players
    const players = await redisClient.sMembers(key)
    return players.length === 0
  }

  private async handleEmptyPlayground() {
    console.log("PLAYGROUND IS EMPTY CLEANING UP PLAYGROUND", )
    // save node positions to db
    await this.saveRealtimeNodePositionsToDb()
    await this.removeNodePositionsFromPlayground()

    // Remove playground from redis
    await redisClient.sRem(Key.playgrounds, this.playgroundId)
  }

  private async removeNodePositionsFromPlayground() {
    const keyPattern = `${Key.playgrounds}:${this.playgroundId}:${Key.nodes}:*`
    const keys = await redisClient.keys(keyPattern)
    await redisClient.del(keys)
  }

  private nodeModelsToData = (nodeModels: (EntityModel | MemoModel)[]): (IEntityModel | IMemoModel)[] => {
    return nodeModels.map(nodeModel => nodeModel.toJSON() as IEntityModel | IMemoModel)
  }

  private async saveRealtimeNodePositionsToDb() {
    await Promise.all([
      await this.getNodeModels()
        .then(nodes => Promise.all(nodes.map(node => node.saveRealtimePosition()))),
    ])

  }

  private async onDisconnect() {
    console.log("DISCONNECT: ", this.socket.id)

    try {

      // Remove player from playground
      await this.removePlayerFromPlayground()

      // Check if playground is empty
      const isPlaygroundEmpty = await this.isPlaygroundEmpty()

      if (isPlaygroundEmpty) {
        // Handle empty playground
        await this.handleEmptyPlayground()
      } else {

        // Emit player leave event to other players
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
      this.getNodeModels().then(this.nodeModelsToData),
      this.getPlayers().then(this.applyPlayerCursorPositionToPlayers),
      ErdModel.findByPk(this.playgroundId).then(erd => erd?.toJSON()),
      RelationModel.findAll({
        where: {
          erdId: this.playgroundId
        }
      }).then(relations => relations.map(r => r.toJSON()))
    ])

    return {
      ...erd,
      players,
      relations,
      nodes,
    }
  }


  private setNodesPosition = async (nodes: (IEntityModel | IMemoModel)[]) => {
    const nodeKeyValueData: { [key: string]: string } = {}
    nodes.forEach(node => {
      const key = `${Key.playgrounds}:${node.erdId}:${Key.nodes}:${node.id}:${Key.position}`
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

