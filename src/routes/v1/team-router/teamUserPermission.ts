import {RequestHandler} from "express";
import {UserTeamModel} from "../../../sequelize-models/erd-api/UserTeam.model";
import httpStatus from "http-status";
import {internalErrorHandler} from "../../../utils/errorHandler";

export type TeamUserPermissionRequestParams = {
  teamId: string;
}

export const teamUserPermission: RequestHandler<TeamUserPermissionRequestParams> = async (req, res) => {
  try {
    const data = await UserTeamModel.findOne({
      where: {
        teamId: req.params.teamId,
        userId: req.authorizationUser?.id
      }
    })

    if (!data) return res.sendStatus(httpStatus.NOT_FOUND)

    res.json(data)

  } catch (e) {
    internalErrorHandler(e, req, res)
  }
}
