import {CallbackDataStatus, Key, EntityEnum} from "../../enums/multiplayer";
import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../sequelize-models/erd-api";
import {ColumnModel} from "../../sequelize-models/erd-api/Column.model";
import {EntityModel, IEntityModel} from "../../sequelize-models/erd-api/Entity.model"

export interface CallbackDataType {
  type: EntityEnum;
  status: CallbackDataStatus
  data: any
}

// Helper functions
function getCallbackData(type: EntityEnum): CallbackDataType {
  return {
    type,
    status: CallbackDataStatus.FAILED,
    data: null
  }
}

export const entityControllers = (io: Server, socket: Socket, redis: RedisClientType) => {
  const playgroundId = socket.handshake.auth['playgroundId']
  const playgroundKey = `${Key.playground}:${playgroundId}`

  async function onAdd(entityData: any, callback: Function) {
    const callbackData = getCallbackData(EntityEnum.add)
    let transaction: Transaction | null = null
    try {
      transaction = await erdSequelize.transaction()
      const {data, ...icTable} = entityData

      await EntityModel.create({
        ...icTable,
        name: data.name,
        color: data.color,
        erdId: playgroundId
      }, {transaction})
      await ColumnModel.bulkCreate(data.columns, {transaction})
      await redis.json.arrAppend(playgroundKey, '.entities', entityData as any)
      await transaction.commit()

      socket.to(playgroundKey).emit(EntityEnum.add, entityData)
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = entityData
      callback(callbackData)
    } catch (e) {
      await transaction?.rollback()
      console.error(e)
      callback(callbackData)
    }

  }

  async function onUpdate(entityData: IEntityModel, callback: Function) {
    const callbackData = getCallbackData(EntityEnum.update)

    try {
      if (entityData.position) {
        socket.to(playgroundKey).emit(EntityEnum.update, {...entityData, type: "position"})
        await redis.json.set(playgroundKey, `.entities[?(@.id=='${entityData.id}')].position`, entityData.position as any)
        callbackData.status = CallbackDataStatus.OK
        callback(callbackData)
      }
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }

  }

  async function onDelete(entityId: string, callback: Function) {
    const callbackData = getCallbackData(EntityEnum.delete)

    try {
      await redis.json.del(playgroundKey, `.entities[?(@.id=='${entityId}')]`)
      socket.to(playgroundKey).emit(EntityEnum.delete, entityId)
      await EntityModel.destroy({
        where: {
          id: entityId
        }
      })
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = entityId
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }

  async function onSet({entityId, key, value}: { entityId: string, key: string, value: any }, callback: Function) {
    const callbackData = getCallbackData(EntityEnum.set)

    try {
      await redis.json.set(playgroundKey, `$.entities[?(@.id=='${entityId}')].data.${key}`, value)
      socket.to(playgroundKey).emit(EntityEnum.set, {entityId, data: {[key]: value}})
      await EntityModel.update({
        [key]: value
      }, {
        where: {
          id: entityId
        }
      })
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = {
        entityId,
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
