import {CallbackDataStatus, ErdEnum} from "../../enums/multiplayer";
import {ErdModel, IErdModel} from "../../sequelize-models/erd-api/Erd.model";
import {MultiplayerControllerBase} from "../../utils/multiplayerControllerBase";
import {Server, Socket} from "socket.io";

export class ErdController extends MultiplayerControllerBase<ErdEnum> {
  constructor(io: Server, socket: Socket) {
    super(io, socket);

    this.initListeners()
  }

  initListeners = () => {
    this.socket.on(ErdEnum.put, this.onPut)
    this.socket.on(ErdEnum.patch, this.onPatch)
  }

  onPut = async (data: Partial<IErdModel>, callback: Function) => {
    const callbackData = this.getCallbackData(ErdEnum.put)

    try {
      await Promise.all([
        ErdModel.update(data, {
          where: {
            id: this.playgroundId
          }
        })
      ])
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = data
      this.socket.to(this.playgroundKey).emit(ErdEnum.put, data)
      callback(callbackData)

    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }


  onPatch = async ({key, value}: { key: string, value: any }, callback: Function) => {
    const callbackData = this.getCallbackData(ErdEnum.patch)

    try {
      await Promise.all([
        ErdModel.update({[key]: value}, {
          where: {
            id: this.playgroundId
          }
        })
      ])

      callbackData.status = CallbackDataStatus.OK
      callbackData.data[key] = value
      this.socket.to(this.playgroundKey).emit(ErdEnum.patch, {key, value})
      callback(callbackData)

    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }
}
