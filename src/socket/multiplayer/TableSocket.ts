import {IMultiplayerListeners, MULTIPLAYER_SOCKET} from "../../constants/multiplayer";
import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {Column} from "../../sequelize-models/erd-api/Column.model";
import {Relation} from "../../sequelize-models/erd-api/Relation.model";
import {Table} from "../../sequelize-models/erd-api/Table.model";

export class TableSocket {
  roomKey: string
  socket: Socket
  redis: RedisClientType
  io: Server

  constructor(roomKey: string, socket: Socket, redis: RedisClientType, io: Server) {
    this.roomKey = roomKey
    this.socket = socket
    this.redis = redis
    this.io = io
    this.initSubscriptions()
  }

  get erdId() {
    return this.roomKey.split(":")[1]!
  }

  initSubscriptions() {
    this.socket
      .on(MULTIPLAYER_SOCKET.ADD_TABLE, this.addTable)
      .on(MULTIPLAYER_SOCKET.UPDATE_TABLE, this.updateTable)
      .on(MULTIPLAYER_SOCKET.DELETE_TABLE, this.deleteTable)
      .on(MULTIPLAYER_SOCKET.SUBSCRIBE_TO_TABLE_DATE, this.subscribeToTableData)
      .on(MULTIPLAYER_SOCKET.ADD_TABLE_COLUMN, this.addTableColumn)
      .on(MULTIPLAYER_SOCKET.UPDATED_TABLE_COLUMN, this.updateTableColumn)
      .on(MULTIPLAYER_SOCKET.DELETE_TABLE_COLUMN, this.deleteTableColumn)
      .on(MULTIPLAYER_SOCKET.SET_TABLE_DATA, this.setTableData)
      .on(MULTIPLAYER_SOCKET.ADD_RELATION, this.addRelation)
      .on(MULTIPLAYER_SOCKET.DELETE_RELATION, this.deleteRelation)
  }

  // Table actions
  addTable: IMultiplayerListeners['addTable'] = async (tableData, callback, onError) => {
    try {
      await this.redis.json.arrAppend(this.roomKey, '.tables', tableData as any)
      this.io.in(this.roomKey).emit(MULTIPLAYER_SOCKET.ADD_TABLE, tableData)

      const {data, ...icTable} = tableData
      await Table.create({
        ...icTable,
        name: data.name,
        color: data.color,
        erdId: this.erdId
      })
      callback()
    } catch (e) {
      onError(e)
      console.error(e)
    }
  }
  updateTable: IMultiplayerListeners['updateTable'] = async (tableData, callback, onError) => {
    try {
      if (tableData.position) {
        await this.redis.json.set(this.roomKey, `.tables[?(@.id=='${tableData.id}')].position`, tableData.position as any)
        this.socket.to(this.roomKey).emit(MULTIPLAYER_SOCKET.UPDATE_TABLE, tableData)
        callback()
      }
    } catch (e) {
      onError(e)
      console.error(e)
    }
  }
  deleteTable: IMultiplayerListeners['deleteTable'] = async (tableId, callback, onError) => {
    try {
      await this.redis.json.del(this.roomKey, `.tables[?(@.id=='${tableId}')]`)
      this.socket.in(this.roomKey).emit(MULTIPLAYER_SOCKET.DELETE_TABLE, tableId)
      await Table.destroy({
        where: {
          id: tableId
        }
      })
      callback()
    } catch (e) {
      onError(e)
      console.error(e)
    }
  }

  subscribeToTableData: IMultiplayerListeners['subscribeToTableData'] = async (tableId, callback, onError) => {
    try {
      this.socket.join(tableId)
      callback()
    } catch (e) {
      onError(e)
      console.error(e)
    }
  }

  // Table column actions
  addTableColumn: IMultiplayerListeners['addTableColumn'] = async (tableId, columnData, callback, onError) => {
    try {
      await this.redis.json.arrAppend(this.roomKey, `$.tables[?(@.id=='${tableId}')].data.columns`, columnData as any)
      this.io.in(this.roomKey).emit(MULTIPLAYER_SOCKET.ADD_TABLE_COLUMN, tableId, columnData)
      await Column.create({
        ...columnData,
        tableId
      })
      callback()
    } catch (e) {
      onError()
    }
  }
  updateTableColumn: IMultiplayerListeners['updateTableColumn'] = async (tableId, columnData, callback, onError) => {
    try {
      await this.redis.json.set(this.roomKey, `$.tables[?(@.id=='${tableId}')].data.columns[?(@.id=='${columnData.id}')]`, columnData as any)
      this.io.in(tableId).emit(MULTIPLAYER_SOCKET.UPDATED_TABLE_COLUMN, tableId, columnData)
      await Column.update(columnData, {
        where: {
          id: columnData.id
        }
      })
      callback()
    } catch (e) {
      onError(e)
      console.error(e)
    }
  }
  deleteTableColumn: IMultiplayerListeners['deleteTableColumn'] = async (tableId, columnId, callback, onError) => {
    try {
      await this.redis.json.del(this.roomKey, `$.tables[?(@.id=='${tableId}')].data.columns[?(@.id=='${columnId}')]`)
      this.io.in(tableId).emit(MULTIPLAYER_SOCKET.DELETE_TABLE_COLUMN, tableId, columnId)
      await Column.destroy({
        where: {
          id: columnId
        }
      })
      callback()
    } catch (e) {
      onError(e)
      console.error(e)
    }
  }

  // Table data actions
  setTableData: IMultiplayerListeners['setTableData'] = async (tableId, key, value, callback, onError) => {
    try {
      await this.redis.json.set(this.roomKey, `$.tables[?(@.id=='${tableId}')].data.${key}`, value)
      this.io.in(tableId).emit(MULTIPLAYER_SOCKET.SET_TABLE_DATA, tableId, key, value)
      await Table.update({
        [key]: value
      }, {
        where: {
          id: tableId
        }
      })

      callback()
    } catch (e) {
      onError(e)
      console.error(e)
    }
  }

  // Table relation actions
  addRelation: IMultiplayerListeners['addRelation'] = async (relation, callback, onError) => {
    try {
      await this.redis.json.arrAppend(this.roomKey, '.relations', relation as any)
      this.io.in(this.roomKey).emit(MULTIPLAYER_SOCKET.ADD_RELATION, relation)
      await Relation.create({
        ...relation,
        erdId: this.roomKey.split(":")[1] as string
      })
      callback()
    } catch (e) {
      onError(e)
      console.error(e)
    }
  }
  deleteRelation: IMultiplayerListeners['deleteRelation'] = async (relationId, callback, onError) => {
    try {
      await this.redis.json.del(this.roomKey, `$.relations[?(@.id=='${relationId}')]`)
      this.io.to(this.roomKey).emit(MULTIPLAYER_SOCKET.DELETE_RELATION, relationId)
      await Relation.destroy({
        where: {
          id: relationId
        }
      })
      callback()
    } catch (e) {
      onError(e)
      console.error(e)
    }
  }

}
