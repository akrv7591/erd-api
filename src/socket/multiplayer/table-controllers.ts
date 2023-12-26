import {CallbackDataStatus, Key, Table} from "../../enums/multiplayer";
import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../sequelize-models/erd-api";
import {Column} from "../../sequelize-models/erd-api/Column.model";
import {ITable, Table as TableModel} from "../../sequelize-models/erd-api/Table.model"

export interface CallbackDataType {
  type: Table;
  status: CallbackDataStatus
  data: any
}

// Helper functions
function getCallbackData(type: Table): CallbackDataType {
  return {
    type,
    status: CallbackDataStatus.FAILED,
    data: null
  }
}

export const tableControllers = (io: Server, socket: Socket, redis: RedisClientType) => {
  const playgroundId = socket.handshake.auth['playgroundId']
  const playgroundKey = `${Key.playground}:${playgroundId}`

  async function onAdd(tableData: any, callback: Function) {
    const callbackData = getCallbackData(Table.add)
    let transaction: Transaction | null = null
    try {
      transaction = await erdSequelize.transaction()
      const {data, ...icTable} = tableData

      await TableModel.create({
        ...icTable,
        name: data.name,
        color: data.color,
        erdId: playgroundId
      }, {transaction})
      await Column.bulkCreate(data.columns, {transaction})
      await transaction.commit()
      await redis.json.arrAppend(playgroundKey, '.tables', tableData as any)
      socket.to(playgroundKey).emit(Table.add, tableData)
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = tableData
      callback(callbackData)
    } catch (e) {
      await transaction?.rollback()
      console.error(e)
      callback(callbackData)
    }

  }

  async function onUpdate(tableData: ITable, callback: Function) {
    const callbackData = getCallbackData(Table.update)

    try {
      if (tableData.position) {
        socket.to(playgroundKey).emit(Table.update, {...tableData, type: "position"})
        await redis.json.set(playgroundKey, `.tables[?(@.id=='${tableData.id}')].position`, tableData.position as any)
        callbackData.status = CallbackDataStatus.OK
        callback(callbackData)
      }
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }

  }

  async function onDelete(tableId: string, callback: Function) {
    const callbackData = getCallbackData(Table.delete)

    try {
      await redis.json.del(playgroundKey, `.tables[?(@.id=='${tableId}')]`)
      socket.to(playgroundKey).emit(Table.delete, tableId)
      await TableModel.destroy({
        where: {
          id: tableId
        }
      })
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = tableId
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }

  async function onSet({tableId, key, value}: { tableId: string, key: string, value: any }, callback: Function) {
    const callbackData = getCallbackData(Table.set)

    try {
      await redis.json.set(playgroundKey, `$.tables[?(@.id=='${tableId}')].data.${key}`, value)
      await TableModel.update({
        [key]: value
      }, {
        where: {
          id: tableId
        }
      })
      socket.to(playgroundKey).emit(Table.set, {tableId, data: {[key]: value}})
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = {
        tableId,
        data: {
          [key]: value
        }
      }
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }

  return {
    onAdd,
    onUpdate,
    onDelete,
    onSet
  }

}
