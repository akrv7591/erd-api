import type {Response} from 'express';
import httpStatus from 'http-status';
import {randomUUID} from 'crypto';
import type {EmailRequestBody, TypedRequest} from '../../../types/types';
import {sendResetEmail} from '../../../utils/sendEmail.util';
import {User} from "../../../sequelize-models/erd-api/User.model";
import {ResetToken} from "../../../sequelize-models/erd-api/ResetToken.model";

/**
 * Sends Forgot password email
 * @param req
 * @param res
 * @returns
 */
export const forgotPassword = async (
  req: TypedRequest<EmailRequestBody>,
  res: Response
) => {
  const {email} = req.body;

  // check req.body values
  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Email is required!'
    });
  }

  // Check if the email exists in the database
  const user = await User.findOne({where: {email}});

  // check if email is verified
  if (!user || user.emailVerified) {
    return res.send(httpStatus.UNAUTHORIZED).json({
      message: 'Your email is not verified! Please confirm your email!'
    });
  }

  // Generate a reset token and save it to the database
  const resetToken = randomUUID();
  const expiresAt = new Date(Date.now() + 3600000); // Token expires in 1 hour
  await ResetToken.create({
    token: resetToken,
    expiresAt,
    userId: user.id
  });

  // Send an email with the reset link
  sendResetEmail(email, resetToken);

  // Return a success message
  return res
    .status(httpStatus.OK)
    .json({message: 'Password reset email sent'});
};
