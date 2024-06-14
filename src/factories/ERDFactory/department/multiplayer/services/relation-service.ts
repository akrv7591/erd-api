import {MultiplayerService} from "../type";
import {CallbackDataStatus, RelationEnum} from "../../../../../enums/multiplayer";
import {RelationModel} from "../../../../../sequelize-models/erd-api/Relation.model";

export const relationService: MultiplayerService = (socket, config, emmitHandler) => {
  socket.on(RelationEnum.add, async (data, callback) => {
    try {
      await RelationModel.create(data.relation)
      socket.to(config.playgroundKey).emit(RelationEnum.add, data, emmitHandler(RelationEnum.add))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(RelationEnum.add, e)
      callback(CallbackDataStatus.FAILED)
    }
  })

  socket.on(RelationEnum.delete, async (data, callback) => {
    try {
      await RelationModel.destroy({
        where: {
          id: data.relationId
        }
      })
      socket.to(config.playgroundKey).emit(RelationEnum.delete, data, emmitHandler(RelationEnum.delete))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(RelationEnum.delete, e)
      callback(CallbackDataStatus.FAILED)
    }
  })
}
