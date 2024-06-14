import * as http from "http";
import {Server} from "socket.io";
import {createAdapter} from "@socket.io/redis-streams-adapter";
import redisClient from "../redis/multiplayerRedisClient";
import config from "../config/config";

export class SocketController {
  io: Server

  constructor(httpServer: http.Server) {
    this.io = new Server(httpServer, {
      adapter: createAdapter(redisClient),
      cors: {
        origin: config.cors.cors_origin.split("|"),
        credentials: true
      }
    })
  }

  static instance: Server

  static getInstance = (httpServer: http.Server) => {
    if (!SocketController.instance) {
      SocketController.instance = new Server(httpServer, {
        adapter: createAdapter(redisClient),
        cors: {
          origin: config.cors.cors_origin.split("|"),
          credentials: true
        }
      })
    }
    return SocketController.instance
  }
}
