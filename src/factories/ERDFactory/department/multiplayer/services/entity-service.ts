import {MultiplayerService} from "../type";
import {CallbackDataStatus, EntityEnum, NodeEnum} from "../../../../../enums/multiplayer";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../../../../sequelize-models/erd-api";
import {EntityModel} from "../../../../../sequelize-models/erd-api/Entity.model";
import {ColumnModel} from "../../../../../sequelize-models/erd-api/Column.model";

export const entityService: MultiplayerService = (socket, config, emmitHandler) => {
  socket.on(EntityEnum.add, async (obj, callback) => {
    let transaction: Transaction | null = null

    try {
      transaction = await erdSequelize.transaction()
      const {data, ...icTable} = obj.entity

      const entity = await EntityModel.create({
        ...icTable,
        name: data.name,
        color: data.color,
        erdId: config.playgroundId,
      }, {transaction})

      await ColumnModel.bulkCreate(data.columns, {transaction})
      await transaction.commit()

      await entity.reload({
        include: [ColumnModel]
      })

      const emitData = {
        node: entity.node()
      }

      socket.to(config.playgroundKey).emit(NodeEnum.add, emitData, emmitHandler(NodeEnum.add))
      callback(CallbackDataStatus.OK)

    } catch (e) {
      console.error(EntityEnum.add, e)
      callback(CallbackDataStatus.FAILED)
    }
  })

  socket.on(EntityEnum.patch, async (data, callback) => {
    try {
      await EntityModel.update({
        [data.key]: data.value
      }, {
        where: {
          id: data.entityId
        }
      })
      socket.to(config.playgroundKey).emit(EntityEnum.patch, data, emmitHandler(EntityEnum.patch))
      callback(CallbackDataStatus.OK)

    } catch (e) {
      console.error(EntityEnum.patch, e)
      callback(CallbackDataStatus.FAILED)
    }
  })

  socket.on(EntityEnum.delete, async (data, callback) => {
    try {
      await EntityModel.destroy({
        where: {
          id: data.entityId
        }
      })

      socket.to(config.playgroundKey).emit(NodeEnum.delete, {nodeId: data.entityId}, emmitHandler(NodeEnum.delete))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(EntityEnum.delete, e)
      callback(CallbackDataStatus.FAILED)
    }
  })
}
