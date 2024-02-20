import {createClient} from "redis";
import config from "../config/config";

export class MultiplayerRedisClient {
  static async getRedisClient() {
    const redisClient = createClient({url: config.redis.url});

    await redisClient.connect();

    return redisClient
  }
}
