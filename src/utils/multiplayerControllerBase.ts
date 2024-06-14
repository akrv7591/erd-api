import {Server, Socket} from "socket.io";
import {CallbackDataStatus, Key} from "../enums/multiplayer";
import {NODE_TYPES} from "../enums/node-type";


export class MultiplayerBase {
  readonly io: Server;
  readonly socket: Socket;

  /**
   * Constructor for EntityController
   * @param io - Socket.IO server
   * @param socket - Socket.IO client socket
   */
  constructor(io: Server, socket: Socket) {
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

  get playgroundNodesPattern(): string {
    return this.playgroundKey + ":" + Key.nodes + ":*"
  }

  get playerRoom(): string {
    return Key.subscribers + ":" + this.playerId
  }


  nodePositionKey(nodeType: NODE_TYPES, nodeId: string): string {
    return this.playgroundKey + ":" + Key.nodes + ":" + nodeType + ":" + nodeId + ":" + Key.position
  }

  nodePositionKeyParsed(key: string): {nodeType: NODE_TYPES, nodeId: string} {
    const parsedKey = key.split(":") as [Key.playgrounds, string, Key.nodes, NODE_TYPES, string, Key.position]

    return {
      nodeType: parsedKey[3],
      nodeId: parsedKey[4],
    }
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
