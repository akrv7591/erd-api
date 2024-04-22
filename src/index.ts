import app from './app';
import config from './config/config';
import logger from './utils/logger';
import {ErdiagramlySequelize} from "./sequelize-models/erd-api";
import * as http from "http";
import redisClient from "./redis/multiplayerRedisClient";
import {S3Util} from "./utils/s3Util";
import {SocketController} from "./socket";


let server: http.Server

(async () => {
  await Promise.all([
    ErdiagramlySequelize.initSequelize(),
    S3Util.initS3(),
    redisClient.connect()
  ])

  console.log("----- ALL GOOD TO GO -----")

  server = http.createServer(app)
  new SocketController(server)

  server.listen(Number(config.server.port), () => {
    logger.log('info', `Server is running on Port: ${config.server.port}`);
  });


})()


process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received.');
  logger.info('Closing server.');
  server.close((err) => {
    logger.info('Server closed.');
    // eslint-disable-next-line no-process-exit
    process.exit(err ? 1 : 0);
  });

  redisClient.quit()
});

