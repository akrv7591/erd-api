import * as http from "http";
import {Server, Socket} from "socket.io";
import {createAdapter} from "@socket.io/redis-streams-adapter";
import redisClient from "../redis/multiplayerRedisClient";
import config from "../config/config";
import {SOCKET} from "../constants/socket";
import {MultiplayerController} from "./multiplayer/multiplayer-controller";

export class SocketController {
  io:  Server
  constructor(httpServer: http.Server) {
    this.io = new Server(httpServer, {
      adapter: createAdapter(redisClient),
      cors: {
        origin: config.cors.cors_origin.split("|"),
        credentials: true
      }
    })

    this.io.on("connection", this.handleConnection)
  }

  private handleConnection = (socket: Socket) => {
    const type = socket.handshake.auth['type'] as SOCKET.TYPE

    switch (type) {
      case SOCKET.TYPE.ERD:
        this.handleErdSocketConnection(socket)

    }
  }

  private handleErdSocketConnection = (socket: Socket) => {
    new MultiplayerController(this.io, socket)
  }


}
