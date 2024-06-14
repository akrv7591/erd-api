import {MultiplayerService} from "../type";
import {CallbackDataStatus, ColumnEnum} from "../../../../../enums/multiplayer";
import {ColumnModel} from "../../../../../sequelize-models/erd-api/Column.model";


export const columnService: MultiplayerService = (socket, config, emmitHandler) => {
  socket.on(ColumnEnum.add, async (data, callback) => {
    try {
      const column = await ColumnModel.create(data.column)
      socket.to(config.playgroundKey).emit(ColumnEnum.add, {column: column.toJSON()}, emmitHandler(ColumnEnum.add))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(ColumnEnum.add, e)
      callback(CallbackDataStatus.FAILED)
    }
  })

  socket.on(ColumnEnum.patch, async (data, callback) => {
    try {
      await ColumnModel.update({[data.key]: data.value}, {
        where: {
          id: data.columnId
        }
      })
      socket.to(config.playgroundKey).emit(ColumnEnum.patch, data, emmitHandler(ColumnEnum.patch))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(ColumnEnum.patch, e)
      callback(CallbackDataStatus.FAILED)
    }
  })

  socket.on(ColumnEnum.delete, async (data, callback) => {
    try {
      await ColumnModel.destroy({
        where: {
          id: data.columnId
        }
      })
      socket.to(config.playgroundKey).emit(ColumnEnum.delete, data, emmitHandler(ColumnEnum.delete))
      callback(CallbackDataStatus.OK)

    } catch (e) {
      console.error(ColumnEnum.delete, e)
      callback(CallbackDataStatus.FAILED)
    }
  })
}
