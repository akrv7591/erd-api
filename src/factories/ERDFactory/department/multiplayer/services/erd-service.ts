import {MultiplayerService} from "../type";
import {CallbackDataStatus, ErdEnum} from "../../../../../enums/multiplayer";
import {ErdModel} from "../../../../../sequelize-models/erd-api/Erd.model";

export const erdService: MultiplayerService = async (socket, config, emmitHandler) => {
  socket.on(ErdEnum.put, (data, callback) => {
    try {
      ErdModel.update(data, {
        where: {
          id: config.playgroundId
        }
      })
      socket.to(config.playgroundKey).emit(ErdEnum.put, data, emmitHandler(ErdEnum.put))
      callback(CallbackDataStatus.OK)
    } catch (e){
      console.error(ErdEnum.put, e)
      callback(CallbackDataStatus.FAILED)
    }
  })

  socket.on(ErdEnum.patch, (data, callback) => {
    try {
      ErdModel.update({[data.key]: data.value}, {
        where: {
          id: config.playgroundId
        }
      })
      socket.to(config.playgroundKey).emit(ErdEnum.patch, data, emmitHandler(ErdEnum.patch))
      callback(CallbackDataStatus.OK)
    } catch (e){
      console.error(ErdEnum.patch, e)
      callback(CallbackDataStatus.FAILED)
    }
  })
}
