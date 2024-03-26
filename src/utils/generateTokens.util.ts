import config from '../config/config';
import {User} from "../sequelize-models/erd-api/User.model";
import {SignJWT} from "jose"


/**
 * This functions generates a valid access token
 *
 * @returns Returns a valid access token
 */
export const createAccessToken = (user: User): Promise<string> => {
  return new SignJWT(user.toJWTPayload())
    .setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime(config.jwt.access_token.expire)
    .sign(config.jwt.access_token.secret)
}

/**
 * This functions generates a valid refresh token
 *
 * @returns Returns a valid refresh token
 */
export const createRefreshToken = (user: User): Promise<string> => {
  return new SignJWT(user.toJWTPayload())
    .setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime(config.jwt.refresh_token.expire)
    .sign(config.jwt.refresh_token.secret)
};
