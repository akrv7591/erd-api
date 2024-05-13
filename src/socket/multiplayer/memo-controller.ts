import {CallbackDataStatus, MemoEnum, NodeEnum} from "../../enums/multiplayer";
import {ICMemoModel, MemoModel} from "../../sequelize-models/erd-api/Memo.mode";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../sequelize-models/erd-api";
import {MultiplayerControllerBase} from "../../utils/multiplayerControllerBase";
import {Server, Socket} from "socket.io";

export class MemoController extends MultiplayerControllerBase<MemoEnum> {
  constructor(io: Server, socket: Socket) {
    super(io, socket);

    this.initListeners()
  }

  initListeners = () => {
    this.socket.on(MemoEnum.add, this.onAdd)
    this.socket.on(MemoEnum.patch, this.onPatch)
    this.socket.on(MemoEnum.delete, this.onDelete)
  }

  onAdd = async (m: ICMemoModel, callback: Function) => {
    const callbackData = this.getCallbackData(MemoEnum.add)
    let transaction: Transaction | null = null

    try {
      transaction = await erdSequelize.transaction()
      const memo = await MemoModel.create(m, {transaction})

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = {
        ...memo.toJSON(),
      }
      await transaction.commit()
      this.socket.to(this.playgroundKey).emit(NodeEnum.add, memo.toJSON())
      callback(callbackData)
    } catch (e) {
      console.error("MEMO ADD ERROR", e)
      await transaction?.rollback()
      callback(callbackData)
    }
  }

  onPatch = async (data: { memoId: string, key: string, value: any }, callback: Function) => {
    const callbackData = this.getCallbackData(MemoEnum.patch)
    let transaction: Transaction | null = null
    try {
      transaction = await erdSequelize.transaction()
      await MemoModel.update({[data.key]: data.value}, {
        where: {
          id: data.memoId
        },
        transaction
      })

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = data
      await transaction.commit()
      this.socket.to(this.playgroundKey).emit(MemoEnum.patch, data)
      callback(callbackData)
    } catch (e) {
      console.error("MEMO PATCH ERROR: ", e)
      await transaction?.rollback()
      callback(callbackData)
    }
  }

  onDelete = async (memoId: string, callback: Function) => {
    const callbackData = this.getCallbackData(MemoEnum.patch)

    try {
      await MemoModel.destroy({
        where: {
          id: memoId
        },
      })

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = {memoId}
      this.socket.to(this.playgroundKey).emit(NodeEnum.delete, memoId)
      callback(callbackData)

    } catch (e) {
      console.error("MEMO DELETE ERROR: ", e)
      callback(callbackData)
    }
  }
}
