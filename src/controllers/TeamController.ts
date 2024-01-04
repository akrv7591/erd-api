import {RequestHandler} from "express";
import {Team} from "../sequelize-models/erd-api/Team.model";
import {User} from "../sequelize-models/erd-api/User.model";
import httpStatus from "http-status";
import {EmailVerificationToken} from "../sequelize-models/erd-api/EmailVerificationToken.model";
import {VERIFICATION_TOKEN} from "../enums/verification-token";
import {errorHandler} from "../middleware/errorHandler";
import {UserTeam} from "../sequelize-models/erd-api/UserTeam.model";
import {matchedData} from "express-validator";

interface IUserListParams {
  teamId: string
}

interface IPermissionParams {
  teamId: string;
}

export default class TeamController {
  public static userList: RequestHandler<IUserListParams> = async (req, res) => {
    try {
      const data = await Team.findOne({
        where: {
          id: req.params.teamId
        },
        include: [{
          model: User,
          include: [{
            model: EmailVerificationToken,
            where: {
              type: VERIFICATION_TOKEN.TEAM_INVITATION,
            },
            required: false
          }]
        }]
      })

      if (!data) return res.sendStatus(httpStatus.NOT_FOUND)

      res.json(data.users)

    } catch (e) {
      errorHandler(e, req, res)
    }
  }

  public static userPermission: RequestHandler<IPermissionParams> = async (req, res) => {
    try {
      const data = await UserTeam.findOne({
        where: {
          teamId: req.params.teamId,
          userId: req.authorizationUser?.id
        }
      })

      if (!data) return res.sendStatus(httpStatus.NOT_FOUND)

      res.json(data)

    } catch (e) {
      errorHandler(e, req, res)
    }
  }

  public static deleteUserFromTeam: RequestHandler = async (req, res) => {
    try {
      const filterData = matchedData(req)
      const data = await UserTeam.findOne({
        where: filterData
      })

      if (!data) return res.sendStatus(httpStatus.NOT_FOUND)

      await data.destroy()

      res.sendStatus(httpStatus.OK)

    } catch (e) {
      errorHandler(e, req, res)
    }
  }
}
