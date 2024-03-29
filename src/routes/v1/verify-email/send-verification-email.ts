import {Request, Response} from "express";
import httpStatus from "http-status";
import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import {EmailVerificationTokenModel} from "../../../sequelize-models/erd-api/EmailVerificationToken.model";
import {Op} from "sequelize";
import {sendVerifyEmail} from "../../../utils/sendEmail.util";
import {EMAIL_VERIFICATION} from "../../../constants/emailVerification";
import {createId} from "@paralleldrive/cuid2";
import {errorHandler} from "../../../middleware/internalErrorHandler";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../../constants/common";

export interface EmailRequestBody {
  email: string;
}
export const sendVerificationEmail = async (
  req: Request<{}, EmailRequestBody>,
  res: Response
) => {
  const {email} = req.body;

  // Check if the email exists in the database
  const user = await UserModel.findOne({
    where: {
      email,
    },
    attributes: ['id', 'emailVerified']
  });

  if (!user) {
    return errorHandler(req, res, HttpStatusCode.Unauthorized, COMMON.API_ERRORS.UNAUTHORIZED)
  }

  // Check if the user-router's email is already verified
  if (user.emailVerified) {
    return res
      .status(httpStatus.CONFLICT)
      .json({error: 'Email already verified'});
  }

  // Check if there is an existing verification token that has not expired
  const existingToken = await EmailVerificationTokenModel.findOne({
    where: {
      user: {id: user.id},
      expiresAt: {
        [Op.gt]: new Date()
      }
    }
  });

  if (existingToken) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({error: 'Verification email already sent'});
  }

  // Generate a new verification token and save it to the database
  const token = createId();
  const expiresAt = new Date(Date.now() + 3600000); // Token expires in 1 hour
  await EmailVerificationTokenModel.create({
    type: EMAIL_VERIFICATION.TYPES.EMAIL,
    token,
    expiresAt,
    userId: user.id
  });

  // Send an email with the new verification link
  sendVerifyEmail(email, token);

  // Return a success message
  return res.status(httpStatus.OK).json({message: 'Verification email sent'});
};
