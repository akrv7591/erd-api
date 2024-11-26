import { Server, Socket as SocketIoType } from "socket.io";
import { SOCKET } from "../constants/socket";
import {IErd} from "../sequelize-models/erd-api/Erd";
import { Viewport } from "./diagram";
import { BROADCAST } from "../namespaces";
import { NodePositionChange, XYPosition } from "./broadcast-data";

export type SocketStatusCallback = (status: SOCKET.STATUS) => void

type WithAcknowledgement<T> = (
  data: T,
  callback?: SocketStatusCallback
) => void;


export interface UserCursorData {
  id: string
  cursor: XYPosition | null
}

interface ListenerEventMaps {
  [SOCKET.DATA.UPDATE_DATA]: WithAcknowledgement<BROADCAST.DATA[]>;
  [SOCKET.USER.SUBSCRIBE]: WithAcknowledgement<string>;
  [SOCKET.USER.UNSUBSCRIBE]: WithAcknowledgement<string>;
  [SOCKET.USER.VIEWPORT_CHANGE]: WithAcknowledgement<Viewport>
  [SOCKET.USER.CURSOR_CHANGE]: WithAcknowledgement<UserCursorData>;
  [SOCKET.USER.NODE_DRAG]: WithAcknowledgement<NodePositionChange[]>;
}

interface EmitEventMaps {
  [SOCKET.USER.JOIN]: WithAcknowledgement<SocketData>;
  [SOCKET.USER.LEFT]: WithAcknowledgement<SocketData>;
  [SOCKET.DATA.INITIAL_DATA]: WithAcknowledgement<IErd['data']>;
  [SOCKET.DATA.INITIAL_DATA_NOT_FOUND]: WithAcknowledgement<null>;
  [SOCKET.DATA.UPDATE_DATA]: WithAcknowledgement<BROADCAST.DATA[]>;
  [SOCKET.USER.SUBSCRIBED]: WithAcknowledgement<string>;
  [SOCKET.USER.UNSUBSCRIBED]: WithAcknowledgement<string>;
  [SOCKET.USER.VIEWPORT_CHANGE]: WithAcknowledgement<Viewport>
  [SOCKET.USER.CURSOR_CHANGE]: WithAcknowledgement<UserCursorData>;
  [SOCKET.USER.NODE_DRAG]: WithAcknowledgement<NodePositionChange[]>;
}
interface ServerEmitEventMaps {}

interface SocketData {
  roomId: string;
  id: string;
  color: string;
  userId: string;
}

interface SocketIoServer
  extends Server<
    ListenerEventMaps,
    EmitEventMaps,
    ServerEmitEventMaps,
    SocketData
  > {}

interface Socket
  extends SocketIoType<
    ListenerEventMaps,
    EmitEventMaps,
    ServerEmitEventMaps,
    SocketData
  > {}

export { SocketIoServer, Socket, SocketData };
