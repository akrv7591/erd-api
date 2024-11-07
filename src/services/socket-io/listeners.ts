import {SocketIoServer, Socket} from "../../types/socket-io";
import {SOCKET} from "../../constants/socket";
import {DataBroadcast} from "../../types/broadcast-data";
import {RedisUtils} from "../../utils/RedisUtils";
import { RoomQueue } from "../rooms-queue";
import { Erd } from "../../sequelize-models/erd-api/Erd";

export const generateListeners = (io: SocketIoServer, socket: Socket) => {
  const {roomId} = socket.data
  const {queueManager} = RoomQueue.getInstance(roomId)

  const handleDisconnect = async () => {
    console.log("User disconnected: ", socket.data.socketId)
    const socketsInRoom = await io.in(roomId).fetchSockets()

    if (socketsInRoom.length > 0) {
      return io.to(roomId).emit(SOCKET.USER.LEFT, socket.data)
    }

    const data = await RedisUtils.getErdData(roomId)

    if (!data) {
      return
    }

    await RedisUtils.deleteErdData(roomId)
    const erd = await Erd.findByPk(roomId)

    if (!erd) {
      return
    }

    erd.data = data
    await erd.save()
  }

  const handleDataUpdate = async (changes: DataBroadcast[]) => {
    queueManager.addTask(RedisUtils.handleBroadcastDataUpdate(roomId, changes))
  }

  return {
    handleDisconnect,
    handleDataUpdate,
  }
}
