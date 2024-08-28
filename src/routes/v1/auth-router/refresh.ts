import {clearRefreshTokenCookieConfig, refreshTokenCookieConfig} from "../../../config/cookieConfig";
import config from "../../../config/config";
import {RefreshTokenModel} from "../../../sequelize-models/erd-api/RefreshToken.model";
import logger from "../../../utils/logger";
import {jwtVerify} from "jose";
import {AuthorizedUser} from "../../../types/express";
import {createAccessToken, createRefreshToken} from "../../../utils/generateTokens.util";
import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {HttpStatusCode} from "axios";
import {AUTH} from "../../../constants/auth";
import type {PostRequest} from "../../../types/types";

/**
 * This function handles the refresh process for users. It expects a request object with the following properties:
 * @returns {Response} Returns an HTTP response that includes one of the following:
 *   - A 401 UNAUTHORIZED status code if the refresh token cookie is undefined
 *   - A 403 FORBIDDEN status code if a refresh token reuse was detected but the token wasn't valid
 *   - A 403 FORBIDDEN status code if a refresh token reuse was detected but the token was valid
 *   - A 403 FORBIDDEN status code if the token wasn't valid
 *   - A 200 OK status code if the token was valid and the user-router was granted a new refresh and access token
 *   - A 500 INTERNAL SERVER ERROR
 */


export const refresh: PostRequest = async (req, res) => {
  const refreshToken: string | undefined =
    req.cookies[config.jwt.refresh_token.cookie_name];

  if (!refreshToken) {
    logger.warn('There are no refresh token in cookies');
    return errorHandler(res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.NO_REFRESH_TOKEN_IN_COOKIES)
  }

  // clear refresh cookie
  res.clearCookie(
    config.jwt.refresh_token.cookie_name,
    clearRefreshTokenCookieConfig
  );

  // check if refresh token is in db
  const foundRefreshToken = await RefreshTokenModel.findOne({
    where: {
      token: refreshToken
    }
  });

  // Detected refresh token reuse!
  if (!foundRefreshToken) {
    try {
      const {payload} = await jwtVerify<AuthorizedUser>(refreshToken, config.jwt.refresh_token.secret)

      logger.warn('Attempted refresh token reuse!');

      // Delete all tokens of the user-router because we detected that a token was stolen from him
      await RefreshTokenModel.destroy({
        where: {
          userId: payload.id
        }
      });

    } catch (err) {
      return errorHandler(res, HttpStatusCode.Forbidden, AUTH.API_ERRORS.REFRESH_TOKEN_INVALID)
    }
    console.log("REFRESH TOKEN FAILED")
    return errorHandler(res, HttpStatusCode.Forbidden, AUTH.API_ERRORS.REFRESH_TOKEN_INVALID)
  }

  // delete from db
  await RefreshTokenModel.destroy({
    where: {
      token: refreshToken
    }
  });


  // evaluate jwt
  try {
    const {payload} = await jwtVerify<AuthorizedUser>(refreshToken, config.jwt.refresh_token.secret)
    const user = await UserModel.findByPk(payload.id)


    // Refresh token was still valid
    const accessToken = await createAccessToken(user!);

    const newRefreshToken = await createRefreshToken(user!);

    // add refresh token to db
    await RefreshTokenModel
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
  } catch (e) {
    internalErrorHandler(res, e)
  }
};
