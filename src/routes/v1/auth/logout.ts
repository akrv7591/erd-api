import {TypedRequest} from "../../../types/types";
import config from "../../../config/config";
import httpStatus from "http-status";
import {RefreshToken} from "../../../sequelize-models/erd-api/RefreshToken.model";
import {clearRefreshTokenCookieConfig} from "../../../config/cookieConfig";
import {Response} from "express";

/**
 * This function handles the logout process for users. It expects a request object with the following properties:
 *
 * @param {TypedRequest} req - The request object that includes a cookie with a valid refresh token
 * @param {Response} res - The response object that will be used to send the HTTP response.
 *
 * @returns {Response} Returns an HTTP response that includes one of the following:
 *   - A 204 NO CONTENT status code if the refresh token cookie is undefined
 *   - A 204 NO CONTENT status code if the refresh token does not exists in the database
 *   - A 204 NO CONTENT status code if the refresh token cookie is successfully cleared
 */
export const logout = async (req: TypedRequest, res: Response) => {
  const cookies = req.cookies;

  if (!cookies[config.jwt.refresh_token.cookie_name]) {
    return res.sendStatus(httpStatus.NO_CONTENT); // No content
  }
  const refreshToken = cookies[config.jwt.refresh_token.cookie_name];

  // Is refreshToken in db?
  const foundRft = await RefreshToken.findOne({
    where: {token: refreshToken}
  });

  if (!foundRft) {
    res.clearCookie(
      config.jwt.refresh_token.cookie_name,
      clearRefreshTokenCookieConfig
    );
    return res.sendStatus(httpStatus.NO_CONTENT);
  }

  // Delete refreshToken in db
  await RefreshToken.destroy({
    where: {token: refreshToken}
  });

  res.clearCookie(
    config.jwt.refresh_token.cookie_name,
    clearRefreshTokenCookieConfig
  );
  return res.sendStatus(httpStatus.NO_CONTENT);
};
