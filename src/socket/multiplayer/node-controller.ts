import {CallbackDataStatus, NodeEnum} from "../../enums/multiplayer";
import {MultiplayerControllerBase} from "../../utils/multiplayerControllerBase";
import redisClient from "../../redis/multiplayerRedisClient";
import {Server, Socket} from "socket.io";

export class NodeController extends MultiplayerControllerBase<NodeEnum> {
  constructor(io: Server, socket: Socket) {
    super(io, socket);

    this.initListeners()
  }

  initListeners = () => {
    this.socket.on(NodeEnum.patchPositions, this.patchPositions)
  }

  patchPositions = async (nodesObject: { [key: string]: string }, callback: Function) => {
    const callbackData = this.getCallbackData(NodeEnum.patchPositions)

    try {

      await redisClient.mSet(nodesObject)
      this.socket.to(this.playgroundKey).emit(NodeEnum.patchPositions, nodesObject)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = nodesObject
      callback(callbackData)
    } catch (e) {
      console.error("SET_NODE_POSITIONS_ERROR", e)
      callback(callbackData)
    }
  }


}
