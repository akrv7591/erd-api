import {Response} from "express";
import {TypedRequest, UserSignUpCredentials} from "../../../types/types";
import httpStatus from "http-status";
import {User} from "../../../sequelize-models/erd-api/User.model";
import * as argon2 from "argon2";
import {randomUUID} from "crypto";
import {EmailVerificationToken} from "../../../sequelize-models/erd-api/EmailVerificationToken.model";
import {sendVerifyEmail} from "../../../utils/sendEmail.util";
import handleAuthTokens from "../../../utils/handleAuthTokens";
import {VERIFICATION_TOKEN} from "../../../enums/verification-token";

/**
 * This function handles the signup process for new users. It expects a request object with the following properties:
 *
 * @param {TypedRequest<UserSignUpCredentials>} req - The request object that includes user-router's username, email, and password-router.
 * @param {Response} res - The response object that will be used to send the HTTP response.
 *
 * @returns {Response} Returns an HTTP response that includes one of the following:
 *   - A 400 BAD REQUEST status code and an error message if the request body is missing any required parameters.
 *   - A 409 CONFLICT status code if the user-router email already exists in the database.
 *   - A 201 CREATED status code and a success message if the new user-router is successfully created and a verification email is sent.
 *   - A 500 INTERNAL SERVER ERROR status code if there is an error in the server.
 */
export const signup = async (
  req: TypedRequest<UserSignUpCredentials>,
  res: Response
) => {
  const {name, email, password} = req.body;

  // check req.body values
  if (!name || !email || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Username, email and password-router are required!'
    });
  }

  const checkUserEmail = await User.findOne({
    where: {
      email
    }
  });

  if (checkUserEmail) return res.sendStatus(httpStatus.CONFLICT); // email is already in db

  try {
    const hashedPassword = await argon2.hash(password);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      isPasswordSet: true
    });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 3600000); // Token expires in 1 hour

    await EmailVerificationToken.create({
      type: VERIFICATION_TOKEN.EMAIL,
      token,
      expiresAt,
      userId: newUser.id
    });

    // Send an email with the verification link
    sendVerifyEmail(email, token);

    const accessToken = await handleAuthTokens(req, res, newUser)

    res.status(httpStatus.CREATED).json({accessToken});
  } catch (err) {
    console.error(err)
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
};
