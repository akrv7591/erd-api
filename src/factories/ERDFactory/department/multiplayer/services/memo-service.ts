import {MultiplayerService} from "../type";
import {CallbackDataStatus, MemoEnum, NodeEnum} from "../../../../../enums/multiplayer";
import {ICMemoModel, MemoModel} from "../../../../../sequelize-models/erd-api/Memo.mode";

export const memoService: MultiplayerService = (socket, config, emmitHandler) => {

  socket.on(MemoEnum.add, async (data, callback) => {
    try {
      const memoData: ICMemoModel = {
        id: data.memo.id,
        content: data.memo.data.content,
        color: data.memo.data.color,
        position: data.memo.position,
        erdId: config.playgroundId,
        userId: config.playerId
      }
      const memo = await MemoModel.create(memoData)

      socket.to(config.playgroundKey).emit(NodeEnum.add, {node: memo.node()}, emmitHandler(NodeEnum.add))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(MemoEnum.add, e)
      callback(CallbackDataStatus.FAILED)
    }
  })

  socket.on(MemoEnum.patch, async (data, callback) => {
    try {
      await MemoModel.update({[data.key]: data.value}, {
        where: {
          id: data.memoId
        }
      })

      socket.to(config.playgroundKey).emit(MemoEnum.patch, data, emmitHandler(MemoEnum.patch))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(MemoEnum.patch, e)
      callback(CallbackDataStatus.FAILED)
    }
  })

  socket.on(MemoEnum.delete, async (data, callback) => {
    try {
      await MemoModel.destroy({where: {id: data.memoId}})
      socket.to(config.playgroundKey).emit(NodeEnum.delete, {nodeId: data.memoId}, emmitHandler(NodeEnum.delete))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(MemoEnum.delete, e)
      callback(CallbackDataStatus.FAILED)
    }
  })
}
