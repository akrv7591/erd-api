import {TypedRequest, UserLoginCredentials} from "../../../types/types";
import {Response} from "express";
import httpStatus from "http-status";
import {User} from "../../../sequelize-models/erd-api/User.model";
import * as argon2 from "argon2";
import config from "../../../config/config";
import {RefreshToken} from "../../../sequelize-models/erd-api/RefreshToken.model";
import {clearRefreshTokenCookieConfig, refreshTokenCookieConfig} from "../../../config/cookieConfig";
import {createAccessToken, createRefreshToken} from "../../../utils/generateTokens.util";

/**
 * This function handles the login process for users. It expects a request object with the following properties:
 *
 * @param {TypedRequest<UserLoginCredentials>} req - The request object that includes user's email and password.
 * @param {Response} res - The response object that will be used to send the HTTP response.
 *
 * @returns {Response} Returns an HTTP response that includes one of the following:
 *   - A 400 BAD REQUEST status code and an error message if the request body is missing any required parameters.
 *   - A 401 UNAUTHORIZED status code if the user email does not exist in the database or the email is not verified or the password is incorrect.
 *   - A 200 OK status code and an access token if the login is successful and a new refresh token is stored in the database and a new refresh token cookie is set.
 *   - A 500 INTERNAL SERVER ERROR status code if there is an error in the server.
 */
export const signin = async (
  req: TypedRequest<UserLoginCredentials>,
  res: Response
) => {
  const cookies = req.cookies;

  const {email, password} = req.body;

  if (!email || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({message: 'Email and password are required!'});
  }

  const user = await User.unscoped().findOne({
    where: {
      email
    },
  });
  if (!user) return res.sendStatus(httpStatus.UNAUTHORIZED);

  // check password
  try {
    if (await argon2.verify(user.password, password)) {
      // if there is a refresh token in the req.cookie, then we need to check if this
      // refresh token exists in the database and belongs to the current user than we need to delete it
      // if the token does not belong to the current user, then we delete all refresh tokens
      // of the user stored in the db to be on the safe site
      // we also clear the cookie in both cases

      if (cookies?.[config.jwt.refresh_token.cookie_name]) {
        // check if the given refresh token is from the current user
        const checkRefreshToken = await RefreshToken.findOne({
          where: {
            token: cookies[config.jwt.refresh_token.cookie_name]
          }
        });

        // if this token does not exists int the database or belongs to another user,
        // then we clear all refresh tokens from the user in the db
        if (!checkRefreshToken || checkRefreshToken.userId !== user.id) {
          await RefreshToken.destroy({
            where: {
              userId: user.id
            }
          });
        } else {
          // else everything is fine and we just need to delete the one token
          await RefreshToken.destroy({
            where: {
              token: cookies[config.jwt.refresh_token.cookie_name]
            }
          });
        }

        // also clear the refresh token in the cookie
        res.clearCookie(
          config.jwt.refresh_token.cookie_name,
          clearRefreshTokenCookieConfig
        );
      }

      const accessToken = createAccessToken(user);
      const newRefreshToken = createRefreshToken(user);

      // store new refresh token in db
      await RefreshToken.create({
        token: newRefreshToken,
        userId: user.id
      });


      // save refresh token in cookie
      res.cookie(
        config.jwt.refresh_token.cookie_name,
        newRefreshToken,
        refreshTokenCookieConfig
      );

      // send access token per json to user so it can be stored in the localStorage
      return res.json({accessToken});
    } else {
      return res.status(httpStatus.UNAUTHORIZED);
    }
  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR);
  }
};
