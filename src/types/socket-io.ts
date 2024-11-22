import { Server, Socket as SocketIoType } from "socket.io";
import { SOCKET } from "../constants/socket";
import {IErd} from "../sequelize-models/erd-api/Erd";
import {DataBroadcast} from "./broadcast-data";
import { Viewport } from "./diagram";

export type SocketStatusCallback = (status: SOCKET.STATUS) => void

type WithAcknowledgement<T> = (
  data: T,
  callback?: SocketStatusCallback
) => void;

interface ListenerEventMaps {
  [SOCKET.DATA.UPDATE_DATA]: WithAcknowledgement<DataBroadcast[]>;
  [SOCKET.USER.SUBSCRIBE]: WithAcknowledgement<string>;
  [SOCKET.USER.UNSUBSCRIBE]: WithAcknowledgement<string>;
  [SOCKET.USER.VIEWPORT_CHANGE]: WithAcknowledgement<Viewport>
}

interface EmitEventMaps {
  [SOCKET.USER.JOIN]: WithAcknowledgement<SocketData>;
  [SOCKET.USER.LEFT]: WithAcknowledgement<SocketData>;
  [SOCKET.DATA.INITIAL_DATA]: WithAcknowledgement<IErd['data']>;
  [SOCKET.DATA.INITIAL_DATA_NOT_FOUND]: WithAcknowledgement<null>;
  [SOCKET.DATA.UPDATE_DATA]: WithAcknowledgement<DataBroadcast[]>;
  [SOCKET.USER.SUBSCRIBED]: WithAcknowledgement<string>;
  [SOCKET.USER.UNSUBSCRIBED]: WithAcknowledgement<string>;
  [SOCKET.USER.VIEWPORT_CHANGE]: WithAcknowledgement<Viewport>
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
