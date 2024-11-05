import { Server, Socket as SocketIoType } from "socket.io";
import { SOCKET } from "../constants/socket";
import {IErd} from "../sequelize-models/erd-api/Erd";
import {DataBroadcast} from "./broadcast-data";

type WithAcknowledgement<T> = (
  data: T,
  callback?: (status: SOCKET.STATUS) => void
) => void;

interface ListenerEventMaps {
  [SOCKET.DATA.UPDATE_DATA]: WithAcknowledgement<DataBroadcast[]>;
}

interface EmitEventMaps {
  [SOCKET.USER.JOIN]: WithAcknowledgement<SocketData>;
  [SOCKET.USER.LEFT]: WithAcknowledgement<SocketData>;
  [SOCKET.DATA.INITIAL_DATA]: WithAcknowledgement<IErd['data']>;
  [SOCKET.DATA.INITIAL_DATA_NOT_FOUND]: WithAcknowledgement<null>;
}
interface ServerEmitEventMaps {}

interface SocketData {
  roomId: string;
  peerId: string;
  userId: string;
  socketId: string;
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
