import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {CallbackDataStatus, Key, PlayerEnum} from "../../enums/multiplayer";

export interface CallbackDataType {
  type: PlayerEnum;
  status: CallbackDataStatus
  data: any
}

// Helper functions

function getCallbackData(type: PlayerEnum): CallbackDataType {
  return {
    type,
    status: CallbackDataStatus.FAILED,
    data: null
  }
}


export const playerController = (io: Server, socket: Socket, redis: RedisClientType) => {
  const playerId = socket.handshake.auth['playerId']
  const playgroundId = socket.handshake.auth['playgroundId']

  async function onSubscribe(targetPlayer: any, callback: Function) {
    const callbackData = getCallbackData(PlayerEnum.subscribe)
    const subscribeKey = `${Key.subscribe}:${targetPlayer.id}`

    try {
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = targetPlayer
      socket.join(subscribeKey)
      socket.to(targetPlayer.id).emit(PlayerEnum.subscribe, playerId)
      callback(callbackData)
      console.log(`Player ${playerId} subscribed to `, subscribeKey)
    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }

  async function onUnsubscribe(targetPlayer: any, callback: Function) {
    const callbackData = getCallbackData(PlayerEnum.unsubscribe)
    const subscribeKey = `${Key.subscribe}:${targetPlayer.id}`

    try {
      socket.leave(subscribeKey)
      socket.to(targetPlayer.id as string).emit(PlayerEnum.unsubscribe, playerId)
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = targetPlayer
      callback(callbackData)
      console.log(`Player ${playerId} unsubscribed from ${subscribeKey}`)
    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }

  async function onViewportChange(data: any, callback: Function) {
    const callbackData = getCallbackData(PlayerEnum.viewpointChange)
    const subscribeKey = [Key.subscribe, playerId].join(":")

    try {
      socket.to(subscribeKey).emit(PlayerEnum.viewpointChange, data)
      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }

  async function onMouseChange(data: any, callback: Function) {
    const callbackData = getCallbackData(PlayerEnum.mouseChange)
    const playgroundKey = [Key.playground, playgroundId].join(":")

    try {
      socket.to(playgroundKey).emit(PlayerEnum.mouseChange, {playerId, cursorPosition: data})
      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }


  return {
    onSubscribe,
    onUnsubscribe,
    onViewportChange,
    onMouseChange
  }
}
