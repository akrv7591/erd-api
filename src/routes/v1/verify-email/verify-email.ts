import {Request, Response} from "express";
import {EmailVerificationTokenModel} from "../../../sequelize-models/erd-api/EmailVerificationToken.model";
import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import handleAuthTokens from "../../../utils/handleAuthTokens";
import {UserTeamModel} from "../../../sequelize-models/erd-api/UserTeam.model";
import {HttpStatusCode} from "axios";
import {EMAIL_VERIFICATION} from "../../../constants/emailVerification";

export type VerifyEmailParams = {
  token: string
}

export async function verifyAuthEmail(req: Request<VerifyEmailParams>, res: Response) {
  try {
    const {token} = req.params;

    // Check if the token exists in the database and is not expired
    const verificationToken = await EmailVerificationTokenModel.findOne({
      where: {token}
    });

    if (!verificationToken) {
      return errorHandler(req, res, HttpStatusCode.NotFound, EMAIL_VERIFICATION.API_ERRORS.NOT_FOUND)
    }

    if (verificationToken.expiresAt < new Date()) {
      return errorHandler(req, res, HttpStatusCode.NotFound, EMAIL_VERIFICATION.API_ERRORS.EXPIRED)
    }

    switch (verificationToken.type) {
      case EMAIL_VERIFICATION.TYPES.EMAIL:
        // Update the user-router's email verification status in the database
        const user = await UserModel.findOne({
          where: {id: verificationToken.userId},
        });

        if (!user) {
          return errorHandler(req, res, HttpStatusCode.NotFound, EMAIL_VERIFICATION.API_ERRORS.NOT_FOUND)
        }

        await user.update({emailVerified: new Date()})
        await user.reload()

        // Delete the verification tokens that the user-router owns from the database
        await verificationToken.destroy()

        const accessToken = await handleAuthTokens(req, res, user)

        // Return a success message
        return res.json({accessToken: accessToken});

      default:
        return errorHandler(req, res, HttpStatusCode.BadRequest, EMAIL_VERIFICATION.API_ERRORS.INVALID)
    }


  } catch (e) {
    internalErrorHandler(e, req, res)
  }
};


export async function verifyJoinTeamEmail(req: Request<VerifyEmailParams>, res: Response) {
  try {
    const {token} = req.params;

    // Check if the token exists in the database and is not expired
    const verificationToken = await EmailVerificationTokenModel.findOne({
      where: {token}
    });

    if (!verificationToken) {
      return errorHandler(req, res, HttpStatusCode.NotFound, EMAIL_VERIFICATION.API_ERRORS.NOT_FOUND);
    }

    if (verificationToken.expiresAt < new Date()) {
      return errorHandler(req, res, HttpStatusCode.NotFound, EMAIL_VERIFICATION.API_ERRORS.EXPIRED)
    }

    switch (verificationToken.type) {
      case EMAIL_VERIFICATION.TYPES.TEAM_INVITATION:
        const userTeam = await UserTeamModel.findOne({
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
        return errorHandler(req, res, HttpStatusCode.BadRequest, EMAIL_VERIFICATION.API_ERRORS.INVALID)
    }
  } catch (e) {
    internalErrorHandler(e, req, res)
  }
};
