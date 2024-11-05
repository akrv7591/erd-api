import config from "./config/config";
import logger from "./utils/logger";
import { ErdiagramlySequelize, erdSequelize } from "./sequelize-models/erd-api";
import { redisClient } from "./redis/redisClient";
import { S3Util } from "./utils/s3Util";
import Express from "express";
import { initApp } from "./app";
import { LogToService } from "./services/logto";
import { createServer } from "http";
import { SocketIo } from "./services/socket-io";

Promise.all([
  new Promise((resolve, reject) => {
    redisClient
      .on("error", (err) => {
        console.log("REDIS CONNECTION ERROR: ", err)
        reject(err)
      })
      .connect()
      .then(redis => resolve(redis))
  }),
  ErdiagramlySequelize.initSequelize(),
  S3Util.initS3(),
  LogToService.init(),
]).then(() => {
  const express = Express();
  const server = createServer(express);
  const socketIo = new SocketIo(server)

  initApp(express);

  server.listen(config.server.port, () => {
    console.log(`Server is running on Port: ${config.server.port}`);
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received.");
    logger.info("Closing server.");

    redisClient.quit();
    erdSequelize.close();
    socketIo.io.disconnectSockets()
  });
});
