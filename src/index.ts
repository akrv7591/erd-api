import app from './app';
import config from './config/config';
import logger from './utils/logger';
import {ErdiagramlySequelize, erdSequelize} from "./sequelize-models/erd-api";
import * as http from "http";
import redisClient from "./redis/multiplayerRedisClient";
import {S3Util} from "./utils/s3Util";
import {ERDFactory} from "./factories/ERDFactory";

let server: http.Server

(async () => {
  await Promise.all([
    ErdiagramlySequelize.initSequelize(),
    S3Util.initS3(),
    redisClient.connect().then(() => console.log("🎉 REDIS CONNECTION SUCCESS")),
  ])

  console.log("----- ALL GOOD TO GO -----")

  server = http.createServer(app)
  // new SocketController(server)

  const erdFactory = new ERDFactory(server)

  erdFactory.startOperation()

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
  erdSequelize.close()
  erdSequelize.close()
});

