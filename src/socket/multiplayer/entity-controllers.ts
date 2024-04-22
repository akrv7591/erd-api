import {CallbackDataStatus, EntityEnum, NodeEnum} from "../../enums/multiplayer";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../sequelize-models/erd-api";
import {ColumnModel} from "../../sequelize-models/erd-api/Column.model";
import {EntityModel} from "../../sequelize-models/erd-api/Entity.model"
import {MultiplayerControllerBase} from "../../utils/multiplayerControllerBase";
import {Server, Socket} from "socket.io";

/**
 * Entity controller class
 */
export class EntityController extends MultiplayerControllerBase<EntityEnum> {
  constructor(io: Server, socket: Socket) {
    super(io, socket);

    this.initListeners()
  }

  /**
   * Initialize Socket.IO event listeners
   */
  initListeners = () => {
    this.socket.on(EntityEnum.add, this.onAdd);
    this.socket.on(EntityEnum.patch, this.onPatch);
    this.socket.on(EntityEnum.delete, this.onDelete);
  };

  /**
   * Handler for 'add' event
   */
  private onAdd = async (entityData: any, callback: Function) => {
    const callbackData = this.getCallbackData(EntityEnum.add)
    let transaction: Transaction | null = null
    try {
      transaction = await erdSequelize.transaction()
      const {data, ...icTable} = entityData

      await EntityModel.create({
        ...icTable,
        name: data.name,
        color: data.color,
        erdId: this.playgroundId
      }, {transaction}),

        await ColumnModel.bulkCreate(data.columns, {transaction}),

        await transaction.commit()

      this.socket.to(this.playgroundKey).emit(EntityEnum.add, entityData)
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = entityData
    } catch (e) {
      await transaction?.rollback()
      console.error(e)
    }
    callback(callbackData)
  };

  /**
   * Handler for 'patch' event
   */
  private onPatch = async (data: { entityId: string, key: string, value: any }, callback: Function) => {
    const callbackData = this.getCallbackData(EntityEnum.patch)

    try {
      await EntityModel.update({
        [data.key]: data.value
      }, {
        where: {
          id: data.entityId
        }
      })
      callbackData.status = CallbackDataStatus.OK
      callbackData.data = data

      this.socket.to(this.playgroundKey).emit(EntityEnum.patch, data)

    } catch (e) {
      console.error(e)
    }
    callback(callbackData)
  };

  /**
   * Handler for 'delete' event
   */
  private onDelete = async (entityId: string | string[], callback: Function) => {
    const callbackData = this.getCallbackData(EntityEnum.delete)

    try {
      await EntityModel.destroy({
        where: {
          id: entityId
        }
      })

      console.log("DELETING ENTITY: ", entityId)

      this.socket.to(this.playgroundKey).emit(NodeEnum.delete, entityId)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = entityId
    } catch (e) {
      console.error(e)
    }
    callback(callbackData)
  };

}
