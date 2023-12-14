import {createClient} from "redis";

export class MultiplayerRedisClient {
  static async getRedisClient() {
    const redisClient = createClient()

    await redisClient.connect();

    return redisClient
  }
}
