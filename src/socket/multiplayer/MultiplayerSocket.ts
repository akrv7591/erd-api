import {Server} from "socket.io";
import * as http from "http";
import config from "../../config/config";
import {createAdapter} from "@socket.io/redis-streams-adapter";
import {RedisClientType} from "redis";
import {KEYS, MULTIPLAYER_SOCKET} from "../../constants/multiplayer";
import {Erd} from "../../sequelize-models/erd-api/Erd.model";
import {ITable, Table} from "../../sequelize-models/erd-api/Table.model";
import {Column, IColumn} from "../../sequelize-models/erd-api/Column.model";
import {Relation} from "../../sequelize-models/erd-api/Relation.model";
import {User} from "../../sequelize-models/erd-api/User.model";
import {TableSocket} from "./TableSocket";
import {IPlayground} from "../../types/playground";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../sequelize-models/erd-api";

export enum CallbackDataStatus {
  OK="ok",
  FAILED="failed"
}

export interface CallbackDataType {
  type: MULTIPLAYER_SOCKET;
  status: CallbackDataStatus
  data: any
}

export class MultiplayerSocket {
  io: Server
  redis: RedisClientType

  constructor(httpServer: http.Server, redisClient: any) {
    this.redis = redisClient
    const io = new Server(httpServer, {
      adapter: createAdapter(redisClient),
      cors: {
        origin: config.cors.cors_origin.split("|")
      }
    })
    io.on("connection", (socket) => {
      socket.on(MULTIPLAYER_SOCKET.ADD_PLAYER, async (erdId, userId, callback) => {
        const callbackData: CallbackDataType = {
          type: MULTIPLAYER_SOCKET.ADD_PLAYER,
          status: CallbackDataStatus.FAILED,
          data: null
        }

        try {
          const playgroundKey = `${KEYS.erd}:${erdId}`
          const playgroundExists = await this.checkIfPlaygroundExist(playgroundKey)

          if (!playgroundExists) {
            await this.addPlayground(playgroundKey)
          }

          const user = await this.addUserToPlayground(playgroundKey, userId)
          const playground = await this.getPlayground(playgroundKey)
          socket.join(playgroundKey)
          socket.to(playgroundKey).emit(MULTIPLAYER_SOCKET.ADD_PLAYER, user)
          new TableSocket(playgroundKey, socket, this.redis, io)
          callbackData.status = CallbackDataStatus.OK
          callbackData.data = playground
          callback(callbackData)
        } catch (e) {
          console.error(e)
          callback(callbackData)
        }
      })
      socket.on(MULTIPLAYER_SOCKET.REMOVE_PLAYER, async (erdId, userId, callback) => {
        const callbackData: CallbackDataType = {
          type: MULTIPLAYER_SOCKET.ADD_PLAYER,
          status: CallbackDataStatus.FAILED,
          data: null
        }
        try {
          const roomKey = `${KEYS.erd}:${erdId}`
          const playerExists = await this.redis.json.type(roomKey, `$.players[?(@.id=='${userId}')]`)

          if (Array.isArray(playerExists) && playerExists.length > 0) {
            await this.redis.json.del(roomKey, `$.players[?(@.id=='${userId}')]`)
            await this.savePlaygroundToDb(roomKey)
            await this.checkAndHandleIfPlaygroundEmpty(roomKey)
            socket.to(roomKey).emit(MULTIPLAYER_SOCKET.REMOVE_PLAYER, userId)
            console.log("PLAYER LEFT WITH ID: ", userId)
            callbackData.status = CallbackDataStatus.OK
            callbackData.data = userId
            callback(callbackData)
          } else {
            console.log("PLAYER DOES NOT EXIST: ", userId)
            callback(callbackData)
          }

        } catch (e) {
          console.error("PLAYER_REMOVE_ERROR:", e)
          callback(callbackData)
        }
      })
    })


    this.io = io
  }

  checkIfPlaygroundExist = async (playgroundKey: string) => {
    const list = await this.redis.json.type(playgroundKey)

    return Array.isArray(list) && list.length > 0;
  }

  addPlayground = async (playgroundKey: string) => {
    const erdId = playgroundKey.split(":")[1]

    const [erd, relations] = await Promise.all([
      Erd.findByPk(erdId, {
        include: [{
          model: Table,
          include: [{
            model: Column
          }]
        }, {
          model: Relation
        }]
      }),
      Relation.findAll({
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
      await this.redis.json.set(playgroundKey, "$", erdJson as any)
    }
  }

  addUserToPlayground = async (playgroundKey: string, userId: string) => {
    const user = await User.findByPk(userId)

    if (user) {
      const isUserAlreadyInRoom = await this.redis.json.type(playgroundKey, `$.players[?(@.id=='${user.id}')]`)

      if (Array.isArray(isUserAlreadyInRoom) && isUserAlreadyInRoom?.length === 0) {
        await this.redis.json.arrAppend(playgroundKey, '$.players', user.toJSON() as any)
      }
    }

    return user
  }

  getPlayground = async (playgroundKey: string) => {
    return await this.redis.json.get(playgroundKey)
  }

  checkAndHandleIfPlaygroundEmpty = async (playgroundKey: string) => {
    const playersLeft = await this.redis.json.arrLen(playgroundKey, "$.players")

    if (Array.isArray(playersLeft) && !playersLeft[0]) {
      await this.redis.json.del(playgroundKey)
    }
  }

  savePlaygroundToDb = async (playgroundKey: string) => {
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
          Table.bulkCreate(icTables, {
            updateOnDuplicate: ["id", "erdId", "name", "color", "position", "type"],
            transaction
          }),
        ])

        await transaction.commit()

        console.log("PLAYGROUND SAVED TO DB SUCCESSFULLY")
        return "success"
      }

    } catch (e) {
      await transaction?.rollback()
      console.error(e)
      return "failed"
    }
  }

}
