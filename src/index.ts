import app from './app';
import config from './config/config';
import logger from './middleware/logger';
import {erdSequelize} from "./sequelize-models/erd-api";
import * as http from "http";
import {MultiplayerSocket} from "./socket/multiplayer/MultiplayerSocket";
import {MultiplayerRedisClient} from "./redis/multiplayerRedisClient";

const initDb = async () => {
  try {
    await erdSequelize.authenticate()
    // await Relation.sync({force: true})
    // await erdSequelize.sync({alter: true})
  } catch (e) {
    console.error(e)
    throw new Error("DB CONNECTION FAILED")
  }
}

let server: http.Server

(async () => {
  await initDb()
  server = http.createServer(app)
  const redisClient = await MultiplayerRedisClient.getRedisClient()
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
