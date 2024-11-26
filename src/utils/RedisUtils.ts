import { BROADCAST } from "../namespaces";
import {redisClient} from "../redis/redisClient";
import {Erd, IErd} from "../sequelize-models/erd-api/Erd";
import {BroadcastDataUtils, DataToUpdate} from "./BroadcastDataUtils";

export class RedisUtils {
  static redis = redisClient

  static getErdKey(erdId: string) {
    return `erd:${erdId}:data`
  }

  static async getErdData(erdId: string): Promise<IErd['data'] | null> {
    try {
      const erdJsonString = await RedisUtils.redis.get(RedisUtils.getErdKey(erdId))

      if (erdJsonString === null) {
        const erdModel = await Erd.findByPk(erdId)

        if (!erdModel) {
          return null
        }

        await RedisUtils.redis.set(RedisUtils.getErdKey(erdId), JSON.stringify(erdModel.data))

        return erdModel.data
      }

      return JSON.parse(erdJsonString) as IErd['data']
    } catch (e) {
      return null
    }
  }

  static async setErdData(erdId: string, data: IErd['data']) {
    try {
      await RedisUtils.redis.set(RedisUtils.getErdKey(erdId), JSON.stringify(data))
    } catch (e) {
      console.error(e)
    }
  }

  static async deleteErdData(erdId: string) {
    try {
      await RedisUtils.redis.del(RedisUtils.getErdKey(erdId))
    } catch (e) {
      console.error(e)
    }
  }

  static handleBroadcastDataUpdate = (roomId: string, changes: BROADCAST.DATA[]) => async () => {

      const originalData = await RedisUtils.getErdData(roomId) as DataToUpdate

      if (!originalData) {
        console.warn("No data to update")
        return
      }

      const updatedData = BroadcastDataUtils.applyDataChanges(changes, originalData)
      await RedisUtils.setErdData(roomId, updatedData)
  }
}
