import {CallbackDataStatus, RelationEnum} from "../../enums/multiplayer";
import {ICRelationModel, RelationModel as RelationModel} from "../../sequelize-models/erd-api/Relation.model"
import {MultiplayerControllerBase} from "../../utils/multiplayerControllerBase";
import {Server, Socket} from "socket.io";

export class RelationController extends MultiplayerControllerBase<RelationEnum> {
  constructor(io: Server, socket: Socket) {
    super(io, socket);

    this.initListeners()
  }

  initListeners = () => {
    this.socket.on(RelationEnum.add, this.onAdd)
    this.socket.on(RelationEnum.delete, this.onDelete)
  }

  onAdd = async (relation: ICRelationModel, callback: Function) => {
    const callbackData = this.getCallbackData(RelationEnum.add)

    try {
      await RelationModel.create(relation)
      this.socket.to(this.playgroundKey).emit(RelationEnum.add, relation)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = relation
    } catch (e) {
      console.error("RELATION ADD ERROR: ", e)
    }
    callback(callbackData)
  }

  onDelete = async (relationId: string[], callback: Function) => {
    const callbackData = this.getCallbackData(RelationEnum.delete)

    try {
      await RelationModel.destroy({
        where: {
          id: relationId
        }
      })
      this.socket.to(this.playgroundKey).emit(RelationEnum.delete, relationId)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = relationId
    } catch (e) {
      console.error("RELATION DELETE ERROR: ", e)
    }

    callback(callbackData)
  }
}
