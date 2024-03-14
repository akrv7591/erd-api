import {CallbackDataStatus, ErdEnum, Key} from "../../enums/multiplayer";
import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {Erd, IErd} from "../../sequelize-models/erd-api/Erd.model";

export interface CallbackDataType {
  type: ErdEnum;
  status: CallbackDataStatus
  data: any
}

// Helper functions

function getCallbackData(type: ErdEnum): CallbackDataType {
  return {
    type,
    status: CallbackDataStatus.FAILED,
    data: null
  }
}


export const erdController = (io: Server, socket: Socket, redis: RedisClientType) => {
  const playgroundId = socket.handshake.auth['playgroundId']
  const playgroundKey = `${Key.playground}:${playgroundId}`

  const onPut = async (data: Partial<IErd>, callback: Function) => {
    const callbackData = getCallbackData(ErdEnum.put)

    try {
      const erdRedisData: any[] = []

      for (const [key, value] of Object.entries(data)) {
        erdRedisData.push({ key: playgroundKey, path: `$.${key}`, value });
      }

      await Promise.all([
        redis.json.mSet(erdRedisData),
        Erd.update(data, {
          where: {
            id: playgroundId
          }
        })
      ])
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = data
      socket.to(playgroundKey).emit(ErdEnum.put, data)
      callback(callbackData)

    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }


  const onPatch = async ({key, value}: { key: string, value: any }, callback: Function) => {
    const callbackData = getCallbackData(ErdEnum.patch)

    try {
      await Promise.all([
        redis.json.set(playgroundKey, `$.${key}`, value),
        Erd.update({[key]: value}, {
          where: {
            id: playgroundId
          }
        })
      ])

      callbackData.status = CallbackDataStatus.OK
      callbackData.data[key] = value
      socket.to(playgroundKey).emit(ErdEnum.patch, {key, value})
      callback(callbackData)

    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }

  return {
    onPatch,
    onPut
  }

}
