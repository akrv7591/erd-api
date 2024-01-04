import {NextFunction, Request, Response} from "express";
import httpStatus from "http-status";
import {EmailVerificationToken} from "../../../sequelize-models/erd-api/EmailVerificationToken.model";
import {EMAIL_VERIFICATION_ERRORS, VERIFICATION_TOKEN} from "../../../enums/verification-token";
import {errorHandler} from "../../../middleware/errorHandler";
import {User} from "../../../sequelize-models/erd-api/User.model";
import handleAuthTokens from "../../../utils/handleAuthTokens";
import {UserTeam} from "../../../sequelize-models/erd-api/UserTeam.model";

export const verifyAuthEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {token} = req.params;

    if (!token) return res.status(httpStatus.BAD_REQUEST).json({code: EMAIL_VERIFICATION_ERRORS.INVALID});

    // Check if the token exists in the database and is not expired
    const verificationToken = await EmailVerificationToken.findOne({
      where: {token}
    });

    if (!verificationToken) {
      return res.status(httpStatus.NOT_FOUND).json({code: EMAIL_VERIFICATION_ERRORS.NOT_FOUND});
    }

    if (verificationToken.expiresAt < new Date()) {
      return res.status(httpStatus.NOT_FOUND).json({code: EMAIL_VERIFICATION_ERRORS.EXPIRED});
    }

    switch (verificationToken.type) {
      case VERIFICATION_TOKEN.EMAIL:
        // Update the user-router's email verification status in the database
        const user = await User.findOne({
          where: {id: verificationToken.userId},
        });

        if (!user) {
          return res.sendStatus(httpStatus.NOT_FOUND)
        }

        await user.update({emailVerified: new Date()})
        await user.reload()

        // Delete the verification tokens that the user-router owns from the database
        await verificationToken.destroy()

        const accessToken = await handleAuthTokens(req, res, user)

        // Return a success message
        return res.status(httpStatus.OK).json({accessToken: accessToken});

      default:
        return res.status(httpStatus.BAD_REQUEST).json({code: EMAIL_VERIFICATION_ERRORS.INVALID});
    }


  } catch (e) {
    errorHandler(e, req, res)
  }
};


export const verifyJoinTeamEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {token} = req.params;

    if (!token) return res.status(httpStatus.BAD_REQUEST).json({code: EMAIL_VERIFICATION_ERRORS.INVALID});

    // Check if the token exists in the database and is not expired
    const verificationToken = await EmailVerificationToken.findOne({
      where: {token}
    });

    if (!verificationToken) {
      return res.status(httpStatus.NOT_FOUND).json({code: EMAIL_VERIFICATION_ERRORS.NOT_FOUND});
    }

    if (verificationToken.expiresAt < new Date()) {
      return res.status(httpStatus.NOT_FOUND).json({code: EMAIL_VERIFICATION_ERRORS.EXPIRED});
    }

    switch (verificationToken.type) {
      case VERIFICATION_TOKEN.TEAM_INVITATION:
        const userTeam = await UserTeam.findOne({
          where: {
            teamId: verificationToken.token,
            userId: req.authorizationUser?.id
          }
        })

        if (userTeam) {
          userTeam.pending = false
          await userTeam.save()
        }

        await verificationToken.destroy()

        return res.sendStatus(httpStatus.OK)

      default:
        return res.status(httpStatus.BAD_REQUEST).json({code: EMAIL_VERIFICATION_ERRORS.INVALID});
    }
  } catch (e) {
    errorHandler(e, req, res)
  }
};
