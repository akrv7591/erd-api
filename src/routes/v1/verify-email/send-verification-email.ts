import {EmailRequestBody, TypedRequest} from "../../../types/types";
import {Response} from "express";
import httpStatus from "http-status";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {EmailVerificationToken} from "../../../sequelize-models/erd-api/EmailVerificationToken.model";
import {Op} from "sequelize";
import {randomUUID} from "crypto";
import {sendVerifyEmail} from "../../../utils/sendEmail.util";
import {EmailVerification} from "../../../constants/emailVerification";

/**
* Sends Verification email
* @param req
* @param res
* @returns
*/
export const sendVerificationEmail = async (
  req: TypedRequest<EmailRequestBody>,
  res: Response
) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Email is required!' });
  }

  // Check if the email exists in the database
  const user = await User.findOne({
    where: {
      email,
    },
    attributes:  ['id', 'emailVerified']
  });

  if (!user) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ error: 'Email not found' });
  }

  // Check if the user-router's email is already verified
  if (user.emailVerified) {
    return res
      .status(httpStatus.CONFLICT)
      .json({ error: 'Email already verified' });
  }

  // Check if there is an existing verification token that has not expired
  const existingToken = await EmailVerificationToken.findOne({
    where: {
      user: { id: user.id },
      expiresAt: {
        [Op.gt]: new Date()
      }
    }
  });

  if (existingToken) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: 'Verification email already sent' });
  }

  // Generate a new verification token and save it to the database
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 3600000); // Token expires in 1 hour
  await EmailVerificationToken.create({
    type: EmailVerification.Type.EMAIL,
    token,
    expiresAt,
    userId: user.id
  });

  // Send an email with the new verification link
  sendVerifyEmail(email, token);

  // Return a success message
  return res.status(httpStatus.OK).json({ message: 'Verification email sent' });
};
