import app from './app';
import config from './config/config';
import logger from './middleware/logger';
import {ErdiagramlySequelize} from "./sequelize-models/erd-api";
import * as http from "http";
import {MultiplayerSocket} from "./socket/multiplayer/multiplayer-socket";
import {MultiplayerRedisClient} from "./redis/multiplayerRedisClient";
import {S3Util} from "./utils/s3Util";


let server: http.Server

(async () => {
  const [redisClient] = await Promise.all([
    MultiplayerRedisClient.getRedisClient(),
    ErdiagramlySequelize.initSequelize(),
    S3Util.initS3(),
  ])

  server = http.createServer(app)
  new MultiplayerSocket(server, redisClient)

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
});

