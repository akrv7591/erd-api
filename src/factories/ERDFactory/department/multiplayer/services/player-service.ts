import {CallbackDataStatus, Key, PlayerEnum} from "../../../../../enums/multiplayer";
import {MultiplayerService} from "../type";


export const playerService: MultiplayerService = (socket, config, emmitHandler) => {

  socket.on(PlayerEnum.subscribe, (data, callback) => {
    const subscribeKey = Key.subscribers + ":" + data.playerId

    try {
      socket.join(subscribeKey)
      socket.to(subscribeKey).emit(PlayerEnum.subscribe, {
        playerId: config.playerId
      }, emmitHandler(PlayerEnum.subscribe))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(PlayerEnum.subscribe, e)
      callback(CallbackDataStatus.FAILED)
    }
  })

  socket.on(PlayerEnum.unsubscribe, (data, callback) => {
    const subscribeKey = `${Key.subscribers}:${data.playerId}`

    try {
      socket.to(subscribeKey).emit(PlayerEnum.unsubscribe, {
        playerId: config.playerId
      }, emmitHandler(PlayerEnum.unsubscribe))
      socket.leave(subscribeKey)
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(PlayerEnum.unsubscribe, e)
      callback(CallbackDataStatus.FAILED)
    }

  })

  socket.on(PlayerEnum.viewportChange, (data, callback) => {
    const subscribeKey = [Key.subscribers, config.playerId].join(":")

    try {
      socket.to(subscribeKey).emit(PlayerEnum.viewportChange, data, emmitHandler(PlayerEnum.viewportChange))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(PlayerEnum.viewportChange, e)
      callback(CallbackDataStatus.FAILED)
    }
  })

  socket.on(PlayerEnum.mouseChange,(data, callback) => {
    try {
      socket.to(config.playgroundKey).emit(PlayerEnum.mouseChange, data, emmitHandler(PlayerEnum.mouseChange))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(PlayerEnum.mouseChange, e)
      callback(CallbackDataStatus.FAILED)
    }
  })
}
