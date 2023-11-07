import {Request, Response} from "express";
import httpStatus from "http-status";
import {EmailVerificationToken} from "../../../sequelize-models/erd-api/EmailVerificationToken.model";
import {User} from "../../../sequelize-models/erd-api/User.model";
import handleAuthTokens from "../../../utils/handleAuthTokens";

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) return res.sendStatus(httpStatus.NOT_FOUND);

  // Check if the token exists in the database and is not expired
  const verificationToken = await EmailVerificationToken.findOne({
    where: { token }
  });

  if (!verificationToken || verificationToken.expiresAt < new Date()) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json({ error: 'Invalid or expired token' });
  }

  // Update the user-router's email verification status in the database
  const user = await User.findOne({
    where: { id: verificationToken.userId },
  });

  if (!user) {
    return res.sendStatus(httpStatus.NOT_FOUND
    )
  }

  await user.update({ emailVerified: new Date() })
  await user.reload()

  // Delete the verification tokens that the user-router owns form the database
  await EmailVerificationToken.destroy({
    where: { userId: verificationToken.userId }
  });

  const accessToken = await handleAuthTokens(req, res, user)

  // Return a success message
  return res.status(200).json({ accessToken: accessToken });
};
