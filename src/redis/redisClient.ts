import {createClient} from "redis";
import config from "../config/config";

export const redisClient = createClient({url: config.redis.url})
