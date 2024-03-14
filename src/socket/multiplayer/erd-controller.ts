import {CallbackDataStatus, ErdEnum, Key} from "../../enums/multiplayer";
import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {Erd} from "../../sequelize-models/erd-api/Erd.model";

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


export const playerController = (io: Server, socket: Socket, redis: RedisClientType) => {
  const playgroundId = socket.handshake.auth['playgroundId']
  const playgroundKey = `${Key.playground}:${playgroundId}`


  const onPatch = async ({key, value}: { erdId: string, key: string, value: any }, callback: Function) => {
    const callbackData = getCallbackData(ErdEnum.patch)
    await redis.json.set(playgroundKey, `$.${key}`, value)
    await Erd.update({[key]: value}, {
      where: {
        id: playgroundId
      }
    })

    callbackData.status = CallbackDataStatus.OK
    callbackData.data[key] = value
    socket.to(playgroundKey).emit(ErdEnum.patch, callbackData)
    callback(callbackData)

    try {

    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }

  return {
    onPatch
  }

}
