import {TypedRequest, UserLoginCredentials} from "../../../types/types";
import {Response} from "express";
import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import * as argon2 from "argon2";
import handleAuthTokens from "../../../utils/handleAuthTokens";
import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {HttpStatusCode} from "axios";
import {AUTH} from "../../../constants/auth";

/**
 * This function handles the login process for users. It expects a request object with the following properties:
 *
 * @param {TypedRequest<UserLoginCredentials>} req - The request object that includes user-router's email and password-router.
 * @param {Response} res - The response object that will be used to send the HTTP response.
 *
 * @returns {Response} Returns an HTTP response that includes one of the following:
 *   - A 400 BAD REQUEST status code and an error code if the request body is missing any required parameters.
 *   - A 401 UNAUTHORIZED status code if the user-router email does not exist in the database or the email is not verified or the password-router is incorrect.
 *   - A 200 OK status code and an access token if the login is successful and a new refresh token is stored in the database and a new refresh token cookie is set.
 *   - A 500 INTERNAL SERVER ERROR status code if there is an error in the server.
 */
export const signIn = async (
  req: TypedRequest<UserLoginCredentials>,
  res: Response
) => {

  const {email, password} = req.body;

  if (!email || !password) {
    return errorHandler(req, res, HttpStatusCode.BadRequest, AUTH.API_ERRORS.EMAIL_AND_PASSWORD_REQUIRED)
  }

  const user = await UserModel.unscoped().findOne({
    where: {
      email
    },
  });
  if (!user) {
    return errorHandler(req, res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.USER_NOT_FOUND)
  }

  if (!user.password) {
    return errorHandler(req, res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_AUTHORIZATION)
  }

  // check password-router
  try {
    if (await argon2.verify(user.password, password)) {

      const accessToken = await handleAuthTokens(req, res, user)

      // send access token per json to user-router so it can be stored in the localStorage
      return res.json({accessToken});
    } else {
      return errorHandler(req, res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_AUTHORIZATION)
    }
  } catch (err) {
    internalErrorHandler(err, req,res)
  }
};
