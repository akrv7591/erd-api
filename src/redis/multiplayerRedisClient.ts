import {createClient} from "redis";
import config from "../config/config";

export const createRedisClient = () => createClient({url: config.redis.url})

const redisClient = createRedisClient()

redisClient.on("error", (err) => {
  console.log("REDIS CONNECTION ERROR: ", err)
})

export default redisClient
