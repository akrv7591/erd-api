import {CallbackDataStatus, ColumnEnum} from "../../enums/multiplayer";
import {ColumnModel as ColumnModel, ICColumnModel} from "../../sequelize-models/erd-api/Column.model"
import {MultiplayerControllerBase} from "../../utils/multiplayerControllerBase";
import {Server, Socket} from "socket.io";

export class ColumnController extends MultiplayerControllerBase<ColumnEnum> {
  constructor(io: Server, socket: Socket) {
    super(io, socket);

    this.initListeners()
  }

  initListeners = () => {
    this.socket.on(ColumnEnum.add, this.onAdd);
    this.socket.on(ColumnEnum.patch, this.onPatch);
    this.socket.on(ColumnEnum.delete, this.onDelete);
  }

  onAdd = async (column: ICColumnModel, callback: Function) => {
    const callbackData = this.getCallbackData(ColumnEnum.add)

    try {
      await ColumnModel.create(column)
      this.socket.to(this.playgroundKey).emit(ColumnEnum.add, {column})

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = column
      callback(callbackData)
    } catch (e) {
      console.error(e)
      callback(callbackData)
    }
  }

  onPatch = async (data: {entityId: string, columnId: string, key: string, value: string | number}, callback: Function) => {
    const callbackData = this.getCallbackData(ColumnEnum.patch)

    try {
      this.socket.to(this.playgroundKey).emit(ColumnEnum.patch, data)

      await ColumnModel.update({[data.key]: data.value}, {
        where: {
          id: data.columnId
        }
      })

      callbackData.data = data
      callbackData.status = CallbackDataStatus.OK
      callback(callbackData)

    } catch (e) {
      callback(callbackData)
      console.error(e)
    }

  }

  onDelete = async (columnId: string[], entityId: string, callback: Function) => {
    const callbackData = this.getCallbackData(ColumnEnum.delete)

    try {
      await ColumnModel.destroy({
        where: {
          id: columnId
        }
      })
      this.socket.to(this.playgroundKey).emit(ColumnEnum.delete, columnId, entityId)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = {
        entityId,
        columnId
      }
      callback(callbackData)
    } catch (e) {
      callback(callbackData)
      console.error(e)
    }
  }
}
