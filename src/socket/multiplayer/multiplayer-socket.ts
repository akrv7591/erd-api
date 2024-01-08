import {RedisClientType} from "redis";
import {Server, Socket} from "socket.io";
import {createAdapter} from "@socket.io/redis-streams-adapter";
import config from "../../config/config";
import * as http from "http";
import {playerController} from "./player-controller";
import {Column, Key, Player, Relation, Table} from "../../enums/multiplayer";
import {tableControllers} from "./table-controllers";
import {relationController} from "./relation-controller";
import {columnController} from "./column-controller";
import {Erd} from "../../sequelize-models/erd-api/Erd.model";
import {User} from "../../sequelize-models/erd-api/User.model";
import {Relation as RelationModel} from "../../sequelize-models/erd-api/Relation.model";
import {Column as ColumnModel, IColumn} from "../../sequelize-models/erd-api/Column.model";
import {ITable, Table as TableModel} from "../../sequelize-models/erd-api/Table.model";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../sequelize-models/erd-api";
import {IPlayground} from "../../types/playground";

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
      socket.join(playgroundKey)
      socket.join(playerId)


      let playground = await this.redisClient.json.get(playgroundKey)

      if (!playground) {
        await this.createPlayground(playgroundKey)
      }

      const [player] = await this.addUserToPlayground(playgroundKey, playerId)
      playground = await this.getPlayground(playgroundKey)

      this.io.to(socket.id).emit("data", playground)
      this.io.to(playgroundKey).emit(Player.join, player)

    } catch (e) {
      console.error(e)
    }


    this.initPlayerListeners(socket)
    this.initTableListeners(socket)
    this.initRelationListeners(socket)
    this.initColumnListeners(socket)

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
    const table = tableControllers(this.io, socket, this.redisClient)

    socket.on(Table.add, table.onAdd)
    socket.on(Table.update, table.onUpdate)
    socket.on(Table.delete, table.onDelete)
    socket.on(Table.set, table.onSet)
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

  // Util functions
  private createPlayground = async (playgroundKey: string) => {
    console.log("CREATING PLAYGROUND: ", playgroundKey)
    const erdId = playgroundKey.split(":")[1] as string

    const [erd, relations] = await Promise.all([
      Erd.findByPk(erdId, {
        include: [{
          model: TableModel,
          include: [{
            model: ColumnModel,
          }],
        }, {
          model: RelationModel
        }],
        order: [
          ['tables', 'columns', 'order', 'asc']
        ],
      }),
      RelationModel.findAll({
        where: {
          erdId
        }
      })
    ])

    if (erd) {
      const erdJson = {
        ...erd.toJSON(),
        relations: relations.map(r => r.toJSON()),
        players: []
      }
      await this.redisClient.json.set(playgroundKey, "$", erdJson as any)
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
        const {tables, relations, players, ...erd} = playground
        const columns: IColumn[] = []
        const icTables: ITable[] = tables.map(({data, ...table}) => {
          data.columns.forEach(column => columns.push({...column, tableId: table.id}))

          return {...table, erdId: erd.id, color: data.color, name: data.name}
        })

        await Promise.all([
          Erd.upsert(erd, {transaction}),
          TableModel.bulkCreate(icTables, {
            updateOnDuplicate: ["id", "erdId", "name", "color", "position", "type"],
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

