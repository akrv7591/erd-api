import config from './config/config';
import logger from './utils/logger';
import {ErdiagramlySequelize, erdSequelize} from "./sequelize-models/erd-api";
import redisClient from "./redis/multiplayerRedisClient";
import {S3Util} from "./utils/s3Util";
import expressWebsockets from "express-ws";
import express from "express";
import {initApp} from "./app";
import {initiateHocusPocus} from "./hocuspocus";
import {LogToService} from "./services/logto";


(async () => {
  await Promise.all([
    ErdiagramlySequelize.initSequelize(),
    S3Util.initS3(),
    LogToService.init(),
  ])

  const {app} = expressWebsockets(express())

  // Hocuspocus server for collaboration
  initiateHocusPocus(app)

  // Express api server
  initApp(app)

  app.listen(config.server.port, () => {
    console.log(`Server is running on Port: ${config.server.port}`)
  })
})()


process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received.');
  logger.info('Closing server.');

  redisClient.quit()
  erdSequelize.close()
});

