import {Redis} from "@hocuspocus/extension-redis";
import config from "../../config/config";
import IoRedis from "ioredis"

export const redis = new Redis({
  redis: new IoRedis(config.redis.url)
})
