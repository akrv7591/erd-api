import {NextFunction, Request, Response} from "express";
import {EmailVerificationToken} from "../../../sequelize-models/erd-api/EmailVerificationToken.model";
import {errorHandler, internalErrorHandler} from "../../../middleware/internalErrorHandler";
import {User} from "../../../sequelize-models/erd-api/User.model";
import handleAuthTokens from "../../../utils/handleAuthTokens";
import {UserTeam} from "../../../sequelize-models/erd-api/UserTeam.model";
import {HttpStatusCode} from "axios";
import {EmailVerification} from "../../../constants/emailVerification";

export const verifyAuthEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {token} = req.params;

    if (!token) {
      return errorHandler(req, res, HttpStatusCode.BadRequest, EmailVerification.ApiErrors.INVALID)
    }

    // Check if the token exists in the database and is not expired
    const verificationToken = await EmailVerificationToken.findOne({
      where: {token}
    });

    if (!verificationToken) {
      return errorHandler(req, res, HttpStatusCode.NotFound, EmailVerification.ApiErrors.NOT_FOUND)
    }

    if (verificationToken.expiresAt < new Date()) {
      return errorHandler(req, res, HttpStatusCode.NotFound, EmailVerification.ApiErrors.EXPIRED)
    }

    switch (verificationToken.type) {
      case EmailVerification.Types.EMAIL:
        // Update the user-router's email verification status in the database
        const user = await User.findOne({
          where: {id: verificationToken.userId},
        });

        if (!user) {
          return errorHandler(req, res, HttpStatusCode.NotFound, EmailVerification.ApiErrors.NOT_FOUND)
        }

        await user.update({emailVerified: new Date()})
        await user.reload()

        // Delete the verification tokens that the user-router owns from the database
        await verificationToken.destroy()

        const accessToken = await handleAuthTokens(req, res, user)

        // Return a success message
        return res.json({accessToken: accessToken});

      default:
        return errorHandler(req, res, HttpStatusCode.BadRequest, EmailVerification.ApiErrors.INVALID)
    }


  } catch (e) {
    internalErrorHandler(e, req, res)
  }
};


export const verifyJoinTeamEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {token} = req.params;

    if (!token) {
      return errorHandler(req, res, HttpStatusCode.BadRequest, EmailVerification.ApiErrors.INVALID);
    }

    // Check if the token exists in the database and is not expired
    const verificationToken = await EmailVerificationToken.findOne({
      where: {token}
    });

    if (!verificationToken) {
      return errorHandler(req, res, HttpStatusCode.NotFound, EmailVerification.ApiErrors.NOT_FOUND);
    }

    if (verificationToken.expiresAt < new Date()) {
      return errorHandler(req, res, HttpStatusCode.NotFound, EmailVerification.ApiErrors.EXPIRED)
    }

    switch (verificationToken.type) {
      case EmailVerification.Types.TEAM_INVITATION:
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

        return res.sendStatus(HttpStatusCode.Ok)

      default:
        return errorHandler(req, res, HttpStatusCode.BadRequest, EmailVerification.ApiErrors.INVALID)
    }
  } catch (e) {
    internalErrorHandler(e, req, res)
  }
};
