import {SocketIoServer, Socket} from "../../types/socket-io";
import {SOCKET} from "../../constants/socket";
import {DataBroadcast} from "../../types/broadcast-data";
import {RedisUtils} from "../../utils/RedisUtils";
import { RoomQueue } from "../rooms-queue";

export const generateListeners = (io: SocketIoServer, socket: Socket) => {
  const {roomId} = socket.data
  const {queueManager} = RoomQueue.getInstance(roomId)

  const handleDisconnect = () => {
    console.log("User disconnected: ", socket.data.socketId)
    io.to(roomId).emit(SOCKET.USER.LEFT, socket.data)
  }

  const handleDataUpdate = async (changes: DataBroadcast[]) => {
    queueManager.addTask(RedisUtils.handleBroadcastDataUpdate(roomId, changes))
  }

  return {
    handleDisconnect,
    handleDataUpdate,
  }
}
