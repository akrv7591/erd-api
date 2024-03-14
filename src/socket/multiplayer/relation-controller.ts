import {CallbackDataStatus, Key, RelationEnum} from "../../enums/multiplayer";
import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {Relation as RelationModel} from "../../sequelize-models/erd-api/Relation.model"

export interface CallbackDataType {
  type: RelationEnum;
  status: CallbackDataStatus
  data: any
}

// Helper functions
function getCallbackData(type: RelationEnum): CallbackDataType {
  return {
    type,
    status: CallbackDataStatus.FAILED,
    data: null
  }
}

export function relationController(io: Server, socket: Socket, redis: RedisClientType) {
  const playgroundId = socket.handshake.auth['playgroundId']
  const playgroundKey = `${Key.playground}:${playgroundId}`

  async function onAdd(relation: any, callback: Function) {
    const callbackData = getCallbackData(RelationEnum.add)

    try {
      await redis.json.arrAppend(playgroundKey, '.relations', relation as any)
      socket.to(playgroundKey).emit(RelationEnum.add, relation)
      await RelationModel.create({
        ...relation,
        erdId: playgroundId
      })
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = {
        relation
      }
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }

  }

  async function onDelete(relation: any, callback: Function) {
    const callbackData = getCallbackData(RelationEnum.delete)

    try {
      await redis.json.del(playgroundKey, `$.relations[?(@.id=='${relation.id}')]`)
      socket.to(playgroundKey).emit(RelationEnum.delete, relation.id)
      await RelationModel.destroy({
        where: {
          id: relation.id
        }
      })
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = {
        relation
      }
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }

  return {
    onAdd,
    onDelete
  }
}
