import {CallbackDataStatus, Key, PlayerEnum} from "../../enums/multiplayer";
import {MultiplayerControllerBase} from "../../utils/multiplayerControllerBase";
import {Server, Socket} from "socket.io";

export class PlayerController extends MultiplayerControllerBase<PlayerEnum> {
  constructor(io: Server, socket: Socket) {
    super(io, socket);

    this.initListeners()
  }

  initListeners = () => {
    this.socket.on(PlayerEnum.subscribe, this.onSubscribe)
    this.socket.on(PlayerEnum.unsubscribe, this.onUnsubscribe)
    this.socket.on(PlayerEnum.viewpointChange, this.onViewportChange)
    this.socket.on(PlayerEnum.mouseChange, this.onMouseChange)
  }
  onSubscribe = async (targetPlayerId: string, callback: Function) => {
    const callbackData = this.getCallbackData(PlayerEnum.subscribe)
    const subscribeKey = Key.subscribers + ":" + targetPlayerId

    try {
      this.socket.join(subscribeKey)
      this.socket.to(subscribeKey).emit(PlayerEnum.subscribe, this.playerId)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = targetPlayerId
    } catch (e) {
      console.error(e)
    }
    callback(callbackData)
  }

  onUnsubscribe = async (targetPlayerId: string, callback: Function) => {
    const callbackData = this.getCallbackData(PlayerEnum.unsubscribe)
    const subscribeKey = `${Key.subscribers}:${targetPlayerId}`

    try {
      this.socket.to(subscribeKey).emit(PlayerEnum.unsubscribe, this.playerId)
      this.socket.leave(subscribeKey)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = targetPlayerId
    } catch (e) {
      console.error(e)
    }
    callback(callbackData)
  }

  onViewportChange = async (data: any, callback: Function) => {
    const callbackData = this.getCallbackData(PlayerEnum.viewpointChange)
    const subscribeKey = [Key.subscribers, this.playerId].join(":")

    try {
      this.socket.to(subscribeKey).emit(PlayerEnum.viewpointChange, data)
      callbackData.status = CallbackDataStatus.OK
    } catch (e) {
      console.error(e)
    }
    callback(callbackData)
  }

  onMouseChange = async (data: {x: number, y: number} | null, callback: Function) => {
    const callbackData = this.getCallbackData(PlayerEnum.mouseChange)

    try {
      this.socket.to(this.playgroundKey).emit(PlayerEnum.mouseChange, {playerId: this.playerId, cursorPosition: data})
      callbackData.status = CallbackDataStatus.OK
    } catch (e) {
      console.error(e)
    }
    callback(callbackData)

  }
}
