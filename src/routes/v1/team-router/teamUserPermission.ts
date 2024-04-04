import {UserTeamModel} from "../../../sequelize-models/erd-api/UserTeam.model";
import httpStatus from "http-status";
import {internalErrorHandler} from "../../../utils/errorHandler";
import {GetRequest} from "../../../types/types";

export type TeamUserPermissionParams = {
  teamId: string;
}

export const teamUserPermission: GetRequest<TeamUserPermissionParams> = async (req, res) => {
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
    internalErrorHandler(res, e)
  }
}
