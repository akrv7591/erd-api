import {RedisClientType} from "redis";
import {Server, Socket} from "socket.io";
import {createAdapter} from "@socket.io/redis-streams-adapter";
import config from "../../config/config";
import * as http from "http";
import {playerController} from "./player-controller";
import {Column, Key, Player, Relation, EntityEnum, ErdEnum, MemoEnum} from "../../enums/multiplayer";
import {entityControllers} from "./entity-controllers";
import {relationController} from "./relation-controller";
import {columnController} from "./column-controller";
import {Erd} from "../../sequelize-models/erd-api/Erd.model";
import {User} from "../../sequelize-models/erd-api/User.model";
import {Relation as RelationModel} from "../../sequelize-models/erd-api/Relation.model";
import {Column as ColumnModel} from "../../sequelize-models/erd-api/Column.model";
import {Entity, IEntity} from "../../sequelize-models/erd-api/Entity.model";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../sequelize-models/erd-api";
import {IPlayground} from "../../types/playground";
import {erdController} from "./erd-controller";
import {Memo} from "../../sequelize-models/erd-api/Memo.mode";
import {memoController} from "./memo-controller";

export class MultiplayerSocket {
  io: Server
  redisClient: RedisClientType

  constructor(httpServer: http.Server, redisClient: any) {

    const io = new Server(httpServer, {
      adapter: createAdapter(redisClient),
      cors: {
        origin: config.cors.cors_origin.split("|"),
        credentials: true
      }
    })

    this.io = io
    this.redisClient = redisClient

    io.on("connection", this.onConnection)

  }

  private onConnection = async (socket: Socket) => {
    const playgroundId = socket.handshake.auth['playgroundId']
    const playerId = socket.handshake.auth['playerId']
    const playgroundKey = `${Key.playground}:${playgroundId}`

    console.log("CONNECTION: ", playerId)

    try {
      socket.join([playgroundKey, playerId])

      let playground = await this.getPlayground(playgroundKey)

      if (!playground) {
        await this.createPlayground(playgroundKey)
      }

      const [player] = await this.addUserToPlayground(playgroundKey, playerId)
      playground = await this.getPlayground(playgroundKey)

      this.io.to(socket.id).emit("data", playground)
      this.io.to(playgroundKey).emit(Player.join, player)

    } catch (e) {
      console.error("GET PLAYGROUND ERROR: ", e)
    }


    this.initErdListeners(socket)
    this.initPlayerListeners(socket)
    this.initTableListeners(socket)
    this.initRelationListeners(socket)
    this.initColumnListeners(socket)
    this.initMemoListeners(socket)

    socket.on("disconnect", () => this.onDisconnect(socket))

  }

  private async onDisconnect(socket: Socket) {
    console.log("DISCONNECT: ", socket.id)
    const playgroundId = socket.handshake.auth['playgroundId']
    const playerId = socket.handshake.auth['playerId']
    const playgroundKey = `${Key.playground}:${playgroundId}`

    try {
      socket.leave(playgroundKey)
      await this.redisClient.json.del(playgroundKey, `$.players[?(@.id=='${playerId}')]`)
      await this.savePlaygroundToDb(playgroundKey)
      await this.checkAndHandleIfPlaygroundEmpty(playgroundKey)
      socket.to(playgroundKey).emit(Player.leave, playerId)
    } catch (e) {
      console.error(e)
    }
  }

  // Initiating Erd listeners
  private initErdListeners(socket: Socket) {
    const erd = erdController(this.io, socket, this.redisClient)

    socket.on(ErdEnum.put, erd.onPut)
    socket.on(ErdEnum.patch, erd.onPatch)
  }

  // Initiating Player listeners
  private initPlayerListeners(socket: Socket) {
    const player = playerController(this.io, socket, this.redisClient)

    socket.on(Player.subscribe, player.onSubscribe)
    socket.on(Player.unsubscribe, player.onUnsubscribe)
    socket.on(Player.viewpointChange, player.onViewportChange)
    socket.on(Player.mouseChange, player.onMouseChange)
  }

  // Initiating Table listeners
  private initTableListeners(socket: Socket) {
    const table = entityControllers(this.io, socket, this.redisClient)

    socket.on(EntityEnum.add, table.onAdd)
    socket.on(EntityEnum.update, table.onUpdate)
    socket.on(EntityEnum.delete, table.onDelete)
    socket.on(EntityEnum.set, table.onSet)
  }

  // Initiating Relation listeners
  private initRelationListeners(socket: Socket) {
    const relation = relationController(this.io, socket, this.redisClient)

    socket.on(Relation.add, relation.onAdd)
    socket.on(Relation.delete, relation.onDelete)

  }

  // Initiating Column listeners
  private initColumnListeners(socket: Socket) {
    const column = columnController(this.io, socket, this.redisClient)

    socket.on(Column.add, column.onAdd)
    socket.on(Column.update, column.onUpdate)
    socket.on(Column.delete, column.onDelete)

  }

  // Initiating Memo listeners
  private initMemoListeners(socket: Socket) {
    const memo = memoController(this.io, socket, this.redisClient)

    socket.on(MemoEnum.add, memo.onAdd)
    socket.on(MemoEnum.put, memo.onPut)
    socket.on(MemoEnum.patch, memo.onPatch)
    socket.on(MemoEnum.delete, memo.onDelete)
  }

  // Util functions
  private createPlayground = async (playgroundKey: string) => {
    console.log("CREATING PLAYGROUND: ", playgroundKey)
    const erdId = playgroundKey.split(":")[1] as string

    const [erd, entities, memos, relations] = await Promise.all([

      Erd.findByPk(erdId).then(erd => erd?.toJSON()),
      Entity.findAll({
        where: {
          erdId
        },
        include: [{
          model: ColumnModel,
        }],
        order: [
          ['columns', 'order', 'asc']
        ],
      }).then(entities => entities.map(entity => entity.toJSON())),
      Memo.findAll({
        where: {
          erdId
        }
      }).then(memos => memos.map(memo => memo.toJSON())),
      RelationModel.findAll({
        where: {
          erdId
        }
      }).then(relations => relations.map(r => r.toJSON()))
    ])

    if (erd) {
      erd.entities = entities
      erd.relations = relations
      erd.memos = memos
      // @ts-ignore
      erd.players = []
      await this.redisClient.json.set(playgroundKey, "$", erd as any)
    }
  }

  private addUserToPlayground = async (playgroundKey: string, userId: string) => {
    const user = await User.findByPk(userId)
    let userAdded = false

    if (user) {
      const isUserAlreadyInRoom = await this.redisClient.json.type(playgroundKey, `$.players[?(@.id=='${user.id}')]`)

      if (Array.isArray(isUserAlreadyInRoom) && isUserAlreadyInRoom?.length === 0) {
        await this.redisClient.json.arrAppend(playgroundKey, '$.players', user.toJSON() as any)
        userAdded = true
      }
    }

    return [user, userAdded]
  }

  private getPlayground = async (playgroundKey: string) => {
    return await this.redisClient.json.get(playgroundKey)
  }

  private checkAndHandleIfPlaygroundEmpty = async (playgroundKey: string) => {
    try {
      const players = await this.redisClient.json.arrLen(playgroundKey, "$.players")

      console.log(players)

      if (Array.isArray(players) && players[0] === 0) {
        try {
          await this.redisClient.json.del(playgroundKey)
          console.log("PLAYGROUND DELETED: ", playgroundKey)

        } catch (e) {
          console.log("ERROR DELETING PLAYGROUND: ", playgroundKey)
          console.log(e)
        }
      } else {
        console.log("THERE ARE STILL PLAYERS LEFT")
      }
    } catch (e) {
      console.log("ERROR ON GETTING PLAYERS FROM REDIS")
      console.log(e)
    }
  }

  private savePlaygroundToDb = async (playgroundKey: string) => {
    let transaction: Transaction | null = null

    try {
      transaction = await erdSequelize.transaction()

      const playground = await this.getPlayground(playgroundKey) as unknown as IPlayground | null

      if (playground) {
        const {entities, relations, players, ...erd} = playground
        const icEntities: IEntity[] = entities.map(({data, ...table}) => {
          return {...table, erdId: erd.id, color: data.color, name: data.name}
        })

        await Promise.all([
          Entity.bulkCreate(icEntities, {
            updateOnDuplicate: ["id", "position"],
            transaction
          }),
        ])

        await transaction.commit()

        console.log("PLAYGROUND SAVED TO DB SUCCESSFULLY: ", playgroundKey)
        return "success"
      }

    } catch (e) {
      await transaction?.rollback()
      console.error(e)
      return "failed"
    }
  }
}

