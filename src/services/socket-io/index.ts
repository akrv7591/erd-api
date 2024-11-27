import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { SocketIoServer, Socket } from "../../types/socket-io";
import { SOCKET } from "../../constants/socket";
import { socketIoMiddlewares } from "./socket-io-middlewares";
import { RedisUtils } from "../../utils/RedisUtils";
import { generateListeners } from "./listeners";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import { redisClient } from "../../redis/redisClient";

/**
 * This class is responsible for handling socket.io connections and events.
 */
export class SocketIo {
  io: SocketIoServer;

  /**
   * Creates a new instance of the SocketIo class, initializing the socket.io server.
   *
   * @param httpServer The HTTP server to use for socket.io connections.
   */
  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
      adapter: createAdapter(redisClient),
    });
    this.init();
  }

  /**
   * Initializes the socket.io server by adding middlewares and event listeners.
   */
  init = () => {
    // Add authentication middleware to handle incoming requests
    this.io.use(socketIoMiddlewares.handleAuth);

    // Add query validation middleware to handle incoming requests
    this.io.use(socketIoMiddlewares.handleQueryValidation);

    // Add event listener for new connections
    this.io.on("connection", this.handleConnection);
  };

  /**
   * Handles the connection of a new socket client.
   *
   * @param socket The new socket client that has connected.
   */
  handleConnection = async (socket: Socket) => {
    console.log("User connected: ", socket.data.id);

    // Get the room ID from the socket data
    const { roomId } = socket.data;

    // Fetch all clients in the current room
    const clientSockets = await this.io.in(roomId).fetchSockets();

    // Wait for the new client to join the room
    await socket.join(socket.data.roomId);

    // Join to personal room
    // This room is for subscribers
    await socket.join(socket.data.id + "-room")

    // Emit a JOIN event to each client in the room with the new client's data
    clientSockets.forEach((s) => {
      socket.emit(SOCKET.USER.JOIN, s.data);
    });

    // Emit a JOIN event to all clients in the room with the new client's data
    socket.to(roomId).emit(SOCKET.USER.JOIN, socket.data);

    // Get the room data from Redis for the current room
    const roomData = await RedisUtils.getErdData(socket.data.roomId);

    // Check if the room data exists and emit it to the new client
    if (roomData) {
      socket.emit(SOCKET.DATA.INITIAL_DATA, roomData);
    } else {
      socket.emit(SOCKET.DATA.INITIAL_DATA_NOT_FOUND, null);
    }

    // Initialize socket listeners for the new client
    this.initSocketListeners(socket);
  };

  /**
   * Initializes socket listeners for a given socket client.
   *
   * @param socket The socket client to initialize listeners for.
   */
  initSocketListeners = (socket: Socket) => {
    const listeners = generateListeners(this, socket);

    // Add event listener for when the client disconnects
    socket.on("disconnect", listeners.handleDisconnect);

    // Add event listener for UPDATE_DATA events from clients in the same room
    socket.on(SOCKET.DATA.UPDATE_DATA, listeners.handleDataUpdate);
    socket.on(SOCKET.USER.SUBSCRIBE, listeners.handleSubscribe)
    socket.on(SOCKET.USER.UNSUBSCRIBE, listeners.handleUnsubscribe)
    socket.on(SOCKET.USER.VIEWPORT_CHANGE, listeners.handleViewportChange)
    socket.on(SOCKET.USER.CURSOR_CHANGE, listeners.handleUserCursorChange)
    socket.on(SOCKET.USER.NODE_DRAG, listeners.handleUserNodeDrag)
  };
}
