import {clearRefreshTokenCookieConfig, refreshTokenCookieConfig} from "../../../config/cookieConfig";
import config from "../../../config/config";
import httpStatus from "http-status";
import {RefreshToken} from "../../../sequelize-models/erd-api/RefreshToken.model";
import {Request, Response} from "express";
import logger from "../../../middleware/logger";
import {jwtVerify} from "jose";
import {IAuthorizedUser} from "../../../types/express";
import {createAccessToken, createRefreshToken} from "../../../utils/generateTokens.util";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {AUTH} from "../../../enums/auth";

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
 *   - A 200 OK status code if the token was valid and the user-router was granted a new refresh and access token
 *   - A 500 INTERNAL SERVER ERROR
 */


export const refresh = async (req: Request, res: Response) => {
  const refreshToken: string | undefined =
    req.cookies[config.jwt.refresh_token.cookie_name];

  if (!refreshToken) {
    logger.warn('There are no refresh token in cookies');
    return res.status(httpStatus.UNAUTHORIZED).json({code: AUTH.NO_REFRESH_TOKEN_IN_COOKIES});
  }

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
    try {
      const {payload} = await jwtVerify<IAuthorizedUser>(refreshToken, config.jwt.refresh_token.secret)

      logger.warn('Attempted refresh token reuse!');

      // Delete all tokens of the user-router because we detected that a token was stolen from him
      await RefreshToken.destroy({
        where: {
          userId: payload.id
        }
      });

    } catch (err) {
      if (err) return res.status(httpStatus.FORBIDDEN).json({code: AUTH.REFRESH_TOKEN_INVALID});

    }
    console.log("REFRESH TOKEN FAILED")
    return res.status(httpStatus.FORBIDDEN).json({code: AUTH.REFRESH_TOKEN_INVALID});
  }

  // delete from db
  await RefreshToken.destroy({
    where: {
      token: refreshToken
    }
  });


  // evaluate jwt
  try {
    const {payload} = await jwtVerify<IAuthorizedUser>(refreshToken, config.jwt.refresh_token.secret)
    const user = await User.findByPk(payload.id)


    // Refresh token was still valid
    const accessToken = await createAccessToken(user!);

    const newRefreshToken = await createRefreshToken(user!);

    // add refresh token to db
    await RefreshToken
      .create({
        token: newRefreshToken,
        userId: payload.id
      })

    // Creates Secure Cookie with refresh token
    res.cookie(
      config.jwt.refresh_token.cookie_name,
      newRefreshToken,
      refreshTokenCookieConfig
    );

    return res.json({accessToken});
  } catch (err) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
};
