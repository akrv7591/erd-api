import {MultiplayerService} from "../type";
import {CallbackDataStatus, Key, NodeEnum} from "../../../../../enums/multiplayer";
import redisClient from "../../../../../redis/multiplayerRedisClient";
import {NODE_TYPES} from "../../../../../enums/node-type";

export const makeNodeRedisKey = (erdId: string, type: NODE_TYPES, nodeId: string) => `${Key.playgrounds}:${erdId}:${Key.nodes}:${type}:${nodeId}:${Key.position}`

export const nodeService: MultiplayerService = (socket, config, emmitHandler) => {

  socket.on(NodeEnum.patchPositions, async (data, callback) => {
    try {

      const msetObject: {[key: string]: string} = {}

      data.forEach(obj => {
        const key = makeNodeRedisKey(config.playgroundId, obj.type, obj.nodeId)
        msetObject[key] = JSON.stringify(obj.position)
      })

      await redisClient.mSet(msetObject)
      socket.to(config.playgroundKey).emit(NodeEnum.patchPositions, data, emmitHandler(NodeEnum.patchPositions))
      callback(CallbackDataStatus.OK)
    } catch (e) {
      console.error(NodeEnum.add, e)
      callback(CallbackDataStatus.FAILED)
    }
  })
}
