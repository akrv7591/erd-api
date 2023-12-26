import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {CallbackDataStatus, Key, Player} from "../../enums/multiplayer";

export interface CallbackDataType {
  type: Player;
  status: CallbackDataStatus
  data: any
}

// Helper functions

function getCallbackData(type: Player): CallbackDataType {
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
    const callbackData = getCallbackData(Player.subscribe)
    const subscribeKey = `${Key.subscribe}:${targetPlayer.id}`

    try {
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = targetPlayer
      socket.join(subscribeKey)
      socket.to(targetPlayer.id).emit(Player.subscribe, playerId)
      callback(callbackData)
      console.log(`Player ${playerId} subscribed to `, subscribeKey)
    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }

  async function onUnsubscribe(targetPlayer: any, callback: Function) {
    const callbackData = getCallbackData(Player.unsubscribe)
    const subscribeKey = `${Key.subscribe}:${targetPlayer.id}`

    try {
      socket.leave(subscribeKey)
      socket.to(targetPlayer.id as string).emit(Player.unsubscribe, playerId)
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
    const callbackData = getCallbackData(Player.viewpointChange)
    const subscribeKey = [Key.subscribe, playerId].join(":")

    try {
      socket.to(subscribeKey).emit(Player.viewpointChange, data)
      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)
    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }

  async function onMouseChange(data: any, callback: Function) {
    const callbackData = getCallbackData(Player.mouseChange)
    const playgroundKey = [Key.playground, playgroundId].join(":")

    try {
      socket.to(playgroundKey).emit(Player.mouseChange, {playerId, cursorPosition: data})
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
