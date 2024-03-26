import express from "express";
import config from "../config/config";
import {RefreshToken} from "../sequelize-models/erd-api/RefreshToken.model";
import {User} from "../sequelize-models/erd-api/User.model";
import {clearRefreshTokenCookieConfig, refreshTokenCookieConfig} from "../config/cookieConfig";
import {createAccessToken, createRefreshToken} from "./generateTokens.util";
import {Transaction} from "sequelize";

export default async function handleAuthTokens(req: any, res: express.Response, user: User, transaction: Transaction | null = null) {
  const cookies = req.cookies;

  // if there is a refresh token in the req.cookie, then we need to check if this
  // refresh token exists in the database and belongs to the current user than we need to delete it
  // if the token does not belong to the current user, then we delete all refresh tokens
  // of the user-router stored in the db to be on the safe site
  // we also clear the cookie in both cases

  if (cookies?.[config.jwt.refresh_token.cookie_name]) {
    // check if the given refresh token is from the current user
    const checkRefreshToken = await RefreshToken.findOne({
      where: {
        token: cookies[config.jwt.refresh_token.cookie_name]
      }
    });

    // if this token does not exist int the database or belongs to another user-router,
    // then we clear all refresh tokens from the user-router in the db
    if (!checkRefreshToken || checkRefreshToken.userId !== user.id) {
      await RefreshToken.destroy({
        where: {
          userId: user.id
        },
        transaction,
      });
    } else {
      // else everything is fine, and we just need to delete the one token
      await checkRefreshToken.destroy({transaction})
    }

    // also clear the refresh token in the cookie
    res.clearCookie(
      config.jwt.refresh_token.cookie_name,
      clearRefreshTokenCookieConfig
    );
  }

  const accessToken = await createAccessToken(user);
  const newRefreshToken = await createRefreshToken(user);

  // store new refresh token in db
  await RefreshToken.create({
    token: newRefreshToken,
    userId: user.id
  }, {
    transaction
  });


  // save refresh token in cookie
  res.cookie(
    config.jwt.refresh_token.cookie_name,
    newRefreshToken,
    refreshTokenCookieConfig
  );

  // send access token per json to user-router, so it can be stored in the localStorage
  return accessToken;


}
