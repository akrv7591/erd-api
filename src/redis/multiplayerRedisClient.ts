import {createClient} from "redis";
import config from "../config/config";

const redisClient = createClient({url: config.redis.url})

redisClient.on("error", (err) => {
  console.log("REDIS CONNECTION ERROR: ", err)
})

export default redisClient
