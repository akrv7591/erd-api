import * as http from "http";
import {Server, Socket} from "socket.io";
import {SocketController} from "../../socket";
import {MultiplayerWorker} from "./department/multiplayer";

export class ERDFactory {
  private io: Server

  constructor(server: http.Server) {
    this.io = SocketController.getInstance(server)
  }

  startOperation = () => {
    this.io.on('connection', (playerSocket) => {
      this.joinPlayer(playerSocket)
    })
  }

  private joinPlayer = async (socket: Socket) => {
    const worker = MultiplayerWorker.getInstance(socket)
    await worker.register()
    await worker.firstAssignment()
    worker.startServices()
  }
}
