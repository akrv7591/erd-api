import { Server } from "socket.io"
import { Server as HttpServer } from 'http';
import { SocketIoServer, Socket } from "../../types/socket-io";
import { SOCKET } from "../../constants/socket";
import {socketIoMiddlewares} from "./socket-io-middlewares";
import {RedisUtils} from "../../utils/RedisUtils";
import {generateListeners} from "./listeners";
import {createAdapter} from "@socket.io/redis-streams-adapter";
import {redisClient} from "../../redis/redisClient";

export class SocketIo {
  io: SocketIoServer

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*"
      },
      adapter: createAdapter(redisClient)
    })
    this.init()
  }

  init = () => {
    this.io.use(socketIoMiddlewares.handleAuth)
    this.io.use(socketIoMiddlewares.handleQueryValidation)
    this.io.on("connection", this.handleConnection)
  }

  handleConnection = async (socket: Socket) => {
    console.log("User connected: ", socket.data.socketId)

    await socket.join(socket.data.roomId)
    socket.to(socket.data.roomId).emit(SOCKET.USER.JOIN, socket.data)

    const initialData = await RedisUtils.getErdData(socket.data.roomId)

    if (initialData) {
      socket.emit(SOCKET.DATA.INITIAL_DATA, initialData)
    } else {
      socket.emit(SOCKET.DATA.INITIAL_DATA_NOT_FOUND, null)
    }

    this.initSocketListeners(socket)
  }

  initSocketListeners = (socket: Socket) => {
    const listeners = generateListeners(this.io, socket)

    socket.on("disconnect", listeners.handleDisconnect)
    socket.on(SOCKET.DATA.UPDATE_DATA, listeners.handleDataUpdate)
  }
}
