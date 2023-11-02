import {clearRefreshTokenCookieConfig, refreshTokenCookieConfig} from "../../../config/cookieConfig";
import config from "../../../config/config";
import httpStatus from "http-status";
import {RefreshToken} from "../../../sequelize-models/erd-api/RefreshToken.model";
import {Request, Response} from "express";
import jwt, {type JwtPayload} from "jsonwebtoken";
import logger from "../../../middleware/logger";
import {createAccessToken, createRefreshToken} from "../../../utils/generateTokens.util";
import {User} from "../../../sequelize-models/erd-api/User.model";

/**
 * This function handles the refresh process for users. It expects a request object with the following properties:
 *
 * @param {Request} req - The request object that includes a cookie with a valid refresh token
 * @param {Response} res - The response object that will be used to send the HTTP response.
 *
 * @returns {Response} Returns an HTTP response that includes one of the following:
 *   - A 401 UNAUTHORIZED status code if the refresh token cookie is undefined
 *   - A 403 FORBIDDEN status code if a refresh token reuse was detected but the token wasn't valid
 *   - A 403 FORBIDDEN status code if a refresh token reuse was detected but the token was valid
 *   - A 403 FORBIDDEN status code if the token wasn't valid
 *   - A 200 OK status code if the token was valid and the user was granted a new refresh and access token
 */

// @ts-expect-error
const {verify} = jwt;

export const refresh = async (req: Request, res: Response) => {
  const refreshToken: string | undefined =
    req.cookies[config.jwt.refresh_token.cookie_name];

  if (!refreshToken) return res.sendStatus(httpStatus.UNAUTHORIZED);

  // clear refresh cookie
  res.clearCookie(
    config.jwt.refresh_token.cookie_name,
    clearRefreshTokenCookieConfig
  );

  // check if refresh token is in db
  const foundRefreshToken = await RefreshToken.findOne({
    where: {
      token: refreshToken
    }
  });

  // Detected refresh token reuse!
  if (!foundRefreshToken) {
    verify(
      refreshToken,
      config.jwt.refresh_token.secret,
      async (err: unknown, payload: JwtPayload) => {
        if (err) return res.sendStatus(httpStatus.FORBIDDEN);

        logger.warn('Attempted refresh token reuse!');

        // Delete all tokens of the user because we detected that a token was stolen from him
        await RefreshToken.destroy({
          where: {
            userId: payload.userId
          }
        });
      }
    );
    return res.status(httpStatus.FORBIDDEN);
  }

  // delete from db
  await RefreshToken.destroy({
    where: {
      token: refreshToken
    }
  });


  // evaluate jwt
  verify(
    refreshToken,
    config.jwt.refresh_token.secret,
    async (err: unknown, payload: JwtPayload) => {
      if (err || foundRefreshToken.userId !== payload.userId) {
        return res.sendStatus(httpStatus.FORBIDDEN);
      }

      const user = await User.findOne({
        where: {
          id: payload.userId
        }
      })


      // Refresh token was still valid
      const accessToken = createAccessToken(user!);

      const newRefreshToken = createRefreshToken(user!);

      // add refresh token to db
      await RefreshToken
        .create({
          token: newRefreshToken,
          userId: payload.userId
        })
        .catch((err: Error) => {
          logger.error(err);
        });

      // Creates Secure Cookie with refresh token
      res.cookie(
        config.jwt.refresh_token.cookie_name,
        newRefreshToken,
        refreshTokenCookieConfig
      );

      return res.json({accessToken});
    }
  );
};
