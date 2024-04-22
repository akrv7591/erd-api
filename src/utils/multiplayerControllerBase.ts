import {Server, Socket} from "socket.io";
import {CallbackDataStatus, Key} from "../enums/multiplayer";


export class MultiplayerBase {
  readonly io: Server;
  readonly socket: Socket;

  /**
   * Constructor for EntityController
   * @param io - Socket.IO server
   * @param socket - Socket.IO client socket
   */
  constructor(io: Server, socket: Socket) {
    // this.playgroundId = socket.handshake.auth['playgroundId'];
    // this.playgroundKey = `${Key.playground}:${this.playgroundId}`;
    this.io = io;
    this.socket = socket;
  }

  get playgroundId(): string {
    return this.socket.handshake.auth['playgroundId'];
  }

  get playerId(): string {
    return this.socket.handshake.auth['playerId'];
  }

  get playgroundKey(): string {
    return Key.playgrounds + ":" + this.playgroundId
  }
}

/**
 * Interface for callback data
 */
export interface CallbackDataType<Type> {
  type: Type;
  status: CallbackDataStatus;
  data: any;
}

export class MultiplayerControllerBase<Type> extends MultiplayerBase{
  /**
   * Helper function to generate callback data
   * @param type - Entity type
   * @returns Callback data object
   */
  getCallbackData = (type: Type): CallbackDataType<Type> => ({
    type,
    status: CallbackDataStatus.FAILED,
    data: null
  });
}
