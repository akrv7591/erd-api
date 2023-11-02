import jwt from 'jsonwebtoken';
import config from '../config/config';
import {User} from "../sequelize-models/erd-api/User.model";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const { sign } = jwt;

/**
 * This functions generates a valid access token
 *
 * @returns Returns a valid access token
 */
export const createAccessToken = (user: User): string => {
  return sign(user.toJWTPayload(), config.jwt.access_token.secret, {
    expiresIn: config.jwt.access_token.expire
  });
};

/**
 * This functions generates a valid refresh token
 *
 * @returns Returns a valid refresh token
 */
export const createRefreshToken = (user: User): string => {
  return sign(user.toJWTPayload(), config.jwt.refresh_token.secret, {
    expiresIn: config.jwt.refresh_token.expire
  });
};
