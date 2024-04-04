import {PostRequest} from "../../../types/types";
import httpStatus from "http-status";
import {ResetTokenModel} from "../../../sequelize-models/erd-api/ResetToken.model";
import {Op} from "sequelize";
import * as argon2 from "argon2";
import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import {RefreshTokenModel} from "../../../sequelize-models/erd-api/RefreshToken.model";

export type ResetPasswordParams = {
  token: string
}

export type ResetPasswordBody = {
  newPassword: string;
}

/**
 * Handles Password reset
 * @param req
 * @param res
 * @returns
 */
export const resetPassword: PostRequest<ResetPasswordParams, ResetPasswordBody> = async (req, res) => {
  const {token} = req.params;
  const {newPassword} = req.body;

  if (!token) return res.sendStatus(httpStatus.NOT_FOUND);

  if (!newPassword) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({message: 'New password-router is required!'});
  }

  // Check if the token exists in the database and is not expired
  const resetToken = await ResetTokenModel.findOne({
    where: {
      token,
      expiresAt: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!resetToken) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json({error: 'Invalid or expired token'});
  }

  // Update the user-router's password-router in the database
  const hashedPassword = await argon2.hash(newPassword);
  await UserModel.update({password: hashedPassword}, {
    where: {id: resetToken.userId},
  });

  // Delete the reset and all other reset tokens that the user-router owns from the database
  await ResetTokenModel.destroy({
    where: {userId: resetToken.userId}
  });

  // Delete also all refresh tokens
  await RefreshTokenModel.destroy({
    where: {
      userId: resetToken.userId
    }
  });

  // Return a success message
  return res
    .status(httpStatus.OK)
    .json({message: 'Password reset successful'});
};
