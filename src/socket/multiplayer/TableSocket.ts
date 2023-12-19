import {IMultiplayerListeners, MULTIPLAYER_SOCKET} from "../../constants/multiplayer";
import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {Column} from "../../sequelize-models/erd-api/Column.model";
import {Relation} from "../../sequelize-models/erd-api/Relation.model";
import {Table} from "../../sequelize-models/erd-api/Table.model";
import {erdSequelize} from "../../sequelize-models/erd-api";
import {Transaction} from "sequelize";
import {CallbackDataStatus, CallbackDataType} from "./MultiplayerSocket";

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
  addTable: IMultiplayerListeners['addTable'] = async (tableData, callback) => {
    let transaction: Transaction | null = null
    const callbackData: CallbackDataType = {
      type: MULTIPLAYER_SOCKET.ADD_TABLE,
      status: CallbackDataStatus.FAILED,
      data: null
    }
    try {
      transaction = await erdSequelize.transaction()
      const {data, ...icTable} = tableData

      await Table.create({
        ...icTable,
        name: data.name,
        color: data.color,
        erdId: this.erdId
      }, {transaction})
      await Column.bulkCreate(data.columns, {transaction})
      await transaction.commit()
      await this.redis.json.arrAppend(this.roomKey, '.tables', tableData as any)
      this.io.in(this.roomKey).emit(MULTIPLAYER_SOCKET.ADD_TABLE, tableData)
      callbackData.status= CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      await transaction?.rollback()
      console.error(e)
      callback(callbackData)
    }
  }
  updateTable: IMultiplayerListeners['updateTable'] = async (tableData, callback) => {
    const callbackData: CallbackDataType = {
      type: MULTIPLAYER_SOCKET.ADD_TABLE,
      status: CallbackDataStatus.FAILED,
      data: null
    }
    try {
      if (tableData.position) {
        await this.redis.json.set(this.roomKey, `.tables[?(@.id=='${tableData.id}')].position`, tableData.position as any)
        this.socket.to(this.roomKey).emit(MULTIPLAYER_SOCKET.UPDATE_TABLE, tableData)
        callbackData.status = CallbackDataStatus.OK
        callback(callbackData)
      }
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }
  deleteTable: IMultiplayerListeners['deleteTable'] = async (tableId, callback) => {
    const callbackData: CallbackDataType = {
      type: MULTIPLAYER_SOCKET.ADD_TABLE,
      status: CallbackDataStatus.FAILED,
      data: null
    }
    try {
      await this.redis.json.del(this.roomKey, `.tables[?(@.id=='${tableId}')]`)
      this.socket.in(this.roomKey).emit(MULTIPLAYER_SOCKET.DELETE_TABLE, tableId)
      await Table.destroy({
        where: {
          id: tableId
        }
      })
      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }

  subscribeToTableData: IMultiplayerListeners['subscribeToTableData'] = async (tableId, callback) => {
    const callbackData: CallbackDataType = {
      type: MULTIPLAYER_SOCKET.ADD_TABLE,
      status: CallbackDataStatus.FAILED,
      data: null
    }
    try {
      this.socket.join(tableId)
      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }

  // Table column actions
  addTableColumn: IMultiplayerListeners['addTableColumn'] = async (tableId, columnData, callback) => {
    const callbackData: CallbackDataType = {
      type: MULTIPLAYER_SOCKET.ADD_TABLE,
      status: CallbackDataStatus.FAILED,
      data: null
    }
    try {
      await this.redis.json.arrAppend(this.roomKey, `$.tables[?(@.id=='${tableId}')].data.columns`, columnData as any)
      const column = await Column.create({
        ...columnData,
        tableId
      })
      this.io.in(this.roomKey).emit(MULTIPLAYER_SOCKET.ADD_TABLE_COLUMN, tableId, column)

      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }
  updateTableColumn: IMultiplayerListeners['updateTableColumn'] = async (tableId, columnData, callback) => {
    const callbackData: CallbackDataType = {
      type: MULTIPLAYER_SOCKET.ADD_TABLE,
      status: CallbackDataStatus.FAILED,
      data: null
    }
    try {
      await this.redis.json.set(this.roomKey, `$.tables[?(@.id=='${tableId}')].data.columns[?(@.id=='${columnData.id}')]`, columnData as any)
      this.io.in(tableId).emit(MULTIPLAYER_SOCKET.UPDATED_TABLE_COLUMN, tableId, columnData)
      await Column.update(columnData, {
        where: {
          id: columnData.id
        }
      })
      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }
  deleteTableColumn: IMultiplayerListeners['deleteTableColumn'] = async (tableId, columnId, callback) => {
    const callbackData: CallbackDataType = {
      type: MULTIPLAYER_SOCKET.ADD_TABLE,
      status: CallbackDataStatus.FAILED,
      data: null
    }
    try {
      await this.redis.json.del(this.roomKey, `$.tables[?(@.id=='${tableId}')].data.columns[?(@.id=='${columnId}')]`)
      this.io.in(tableId).emit(MULTIPLAYER_SOCKET.DELETE_TABLE_COLUMN, tableId, columnId)
      await Column.destroy({
        where: {
          id: columnId
        }
      })
      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }

  // Table data actions
  setTableData: IMultiplayerListeners['setTableData'] = async (tableId, key, value, callback) => {
    const callbackData: CallbackDataType = {
      type: MULTIPLAYER_SOCKET.ADD_TABLE,
      status: CallbackDataStatus.FAILED,
      data: null
    }
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
      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }

  // Table relation actions
  addRelation: IMultiplayerListeners['addRelation'] = async (relation, callback) => {
    const callbackData: CallbackDataType = {
      type: MULTIPLAYER_SOCKET.ADD_TABLE,
      status: CallbackDataStatus.FAILED,
      data: null
    }
    try {
      await this.redis.json.arrAppend(this.roomKey, '.relations', relation as any)
      this.io.in(this.roomKey).emit(MULTIPLAYER_SOCKET.ADD_RELATION, relation)
      await Relation.create({
        ...relation,
        erdId: this.roomKey.split(":")[1] as string
      })
      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }
  deleteRelation: IMultiplayerListeners['deleteRelation'] = async (relationId, callback) => {
    const callbackData: CallbackDataType = {
      type: MULTIPLAYER_SOCKET.ADD_TABLE,
      status: CallbackDataStatus.FAILED,
      data: null
    }
    try {
      await this.redis.json.del(this.roomKey, `$.relations[?(@.id=='${relationId}')]`)
      this.io.to(this.roomKey).emit(MULTIPLAYER_SOCKET.DELETE_RELATION, relationId)
      await Relation.destroy({
        where: {
          id: relationId
        }
      })
      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }

}
