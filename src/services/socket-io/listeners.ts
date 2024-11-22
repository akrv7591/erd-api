import { Socket, SocketStatusCallback } from "../../types/socket-io";
import { SOCKET } from "../../constants/socket";
import { RedisUtils } from "../../utils/RedisUtils";
import { RoomQueue } from "../rooms-queue";
import { Erd } from "../../sequelize-models/erd-api/Erd";
import { SocketIo } from ".";
import { DataBroadcast } from "../../types/broadcast-data";
import { Viewport } from "src/types/diagram";

/**
 * Generates listeners for the given socket and room.
 *
 * @param service The SocketIO instance to use.
 * @param socket  The socket object containing the room ID.
 */
export const generateListeners = (service: SocketIo, socket: Socket) => {
  // Extract the room ID from the socket data
  const { roomId } = socket.data;

  // Get the queue manager for the current room
  const { queueManager } = RoomQueue.getInstance(roomId);

  /**
   * Handles user disconnection.
   */
  const handleDisconnect = async () => {
    console.log("User disconnected: ", socket.data.id);
    // Fetch all sockets in the room
    const socketsInRoom = await service.io.in(roomId).fetchSockets();

    if (socketsInRoom.length > 0) {
      // Emit 'left' event to remaining sockets
      return service.io.to(roomId).emit(SOCKET.USER.LEFT, socket.data);
    }

    // Retrieve ERD data from Redis
    const data = await RedisUtils.getErdData(roomId);

    if (!data) {
      return;
    }

    // Delete ERD data from Redis
    await RedisUtils.deleteErdData(roomId);
    // Find the Erd instance by room ID
    const erd = await Erd.findByPk(roomId);

    if (!erd) {
      return;
    }

    // Update ERD data with retrieved data
    erd.data = data;
    // Save changes to Erd instance
    await erd.save();
  };

  /**
   * Handles incoming data updates.
   *
   * @param changes The broadcasted data to process.
   */
  const handleDataUpdate = async (changes: DataBroadcast[]) => {
    // Emit 'updateData' event to connected sockets
    socket.to(roomId).emit(SOCKET.DATA.UPDATE_DATA, changes);
    // Add task to the queue manager for further processing
    queueManager.addTask(RedisUtils.handleBroadcastDataUpdate(roomId, changes));
  };

  const handleSubscribe = (id: string, callback?: SocketStatusCallback) => {
    try {
      socket.join(id + "-room")
      socket.to(id).emit(SOCKET.USER.SUBSCRIBED, socket.id)
      callback?.(SOCKET.STATUS.OK)
    } catch(error) {
      console.error(error)
      callback?.(SOCKET.STATUS.FAILED)
    }
  }

  const handleUnsubscribe = async (id: string, callback?: SocketStatusCallback) => {
    try {
      socket.leave(id + "-room")
      socket.to(id).emit(SOCKET.USER.UNSUBSCRIBED, socket.id)
      callback?.(SOCKET.STATUS.OK)
    } catch(error) {
      console.error(error)
      callback?.(SOCKET.STATUS.FAILED)
    }
  }

  const handleViewportChange = (viewport: Viewport, callback?: SocketStatusCallback) => {
    try {
      socket.to(socket.id + "-room").emit(SOCKET.USER.VIEWPORT_CHANGE, viewport)
    } catch(error) {
      console.error(error)
      callback?.(SOCKET.STATUS.FAILED)
    }
  }

  return {
    handleDisconnect,
    handleDataUpdate,
    handleSubscribe,
    handleUnsubscribe,
    handleViewportChange
  };
};
