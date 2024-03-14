import {CallbackDataStatus, ColumnEnum, Key} from "../../enums/multiplayer";
import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {Column as ColumnModel} from "../../sequelize-models/erd-api/Column.model"

export interface CallbackDataType {
  type: ColumnEnum;
  status: CallbackDataStatus
  data: any
}

// Helper functions
function getCallbackData(type: ColumnEnum): CallbackDataType {
  return {
    type,
    status: CallbackDataStatus.FAILED,
    data: null
  }
}

export function columnController(io: Server, socket: Socket, redis: RedisClientType) {
  const playgroundId = socket.handshake.auth['playgroundId']
  const playgroundKey = `${Key.playground}:${playgroundId}`

  async function onAdd(column: any, callback: Function) {
    const callbackData = getCallbackData(ColumnEnum.add)
    try {
      await redis.json.arrAppend(playgroundKey, `$.entities[?(@.id=='${column.entityId}')].data.columns`, column as any)
      await ColumnModel.create(column)
      socket.to(playgroundKey).emit(ColumnEnum.add, {column})

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = {column}
      callback(callbackData)
    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }

  async function onUpdate(column: any, callback: Function) {
    const callbackData = getCallbackData(ColumnEnum.update)

    try {
      const result = await redis.json.set(playgroundKey, `$.entities[?(@.id=='${column.entityId}')].data.columns[?(@.id=='${column.id}')].${column.key}`, column.value)

      if (result !== "OK") {
        callback(callbackData)
      } else {
        socket.to(playgroundKey).emit(ColumnEnum.update, {column})
        await ColumnModel.update({[column.key]: column.value}, {
          where: {
            id: column.id
          }
        })
        callbackData.status = CallbackDataStatus.OK
        callbackData.data = {column}
        callback(callbackData)
      }

    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }

  async function onDelete(column: any, callback: Function) {
    const callbackData = getCallbackData(ColumnEnum.delete)

    try {
      await redis.json.del(playgroundKey, `$.entities[?(@.id=='${column.entityId}')].data.columns[?(@.id=='${column.id}')]`)
      socket.to(playgroundKey).emit(ColumnEnum.delete, {column})
      await ColumnModel.destroy({
        where: {
          id: column.id
        }
      })
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = { column}

      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }

  return {
    onAdd,
    onUpdate,
    onDelete
  }

}
