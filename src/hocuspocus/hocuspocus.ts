import {Server} from "@hocuspocus/server";
import config from "../config/config";
import expressWebsockets from "express-ws";
import {createErdData, ErdSharedType, updateErdData} from "./collaboration";

export const initiateHocusPocus = (app: expressWebsockets.Application) => {
  const hocuspocusServer = Server.configure({
    port: config.server.port,

    async onAuthenticate(obj) {
      console.log("Token: ", obj.token)
      Object.assign(obj.request, {
        auth: {
          token: obj.token
        }
      })
    },

    async onConnect(obj) {
      console.log("User trying to connected: ", obj.socketId)
    },

    async onLoadDocument(obj) {
      console.time("Synced document from db")
      let store = obj.document.getMap(obj.documentName)
      await createErdData(obj.documentName, store)
      console.timeEnd("Synced document from db")

    },

    async onDisconnect(obj) {
      const data = obj.document.getMap<ErdSharedType>(obj.documentName)
      console.log("User disconnected: ", obj.socketId)
      if (obj.clientsCount === 0) {
        console.time(`Cleanup on all users left ${obj.documentName}`)

        const erdId = obj.documentName

        await updateErdData(erdId, data)

        obj.document.destroy()
        console.timeEnd(`Cleanup on all users left ${obj.documentName}`)
      }
    },

    async connected(obj) {
      console.log("User connected successfully: ", obj.socketId)
    },
  });

  app.ws("/hocuspocus", (websocket, request) => {
    hocuspocusServer.handleConnection(websocket, request);
  });
}
