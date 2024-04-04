import {UserTeamModel} from "../../../sequelize-models/erd-api/UserTeam.model";
import httpStatus from "http-status";
import {internalErrorHandler} from "../../../utils/errorHandler";
import {DeleteRequest} from "../../../types/types";

export type TeamDeleteUserParams = {
  teamId: string
}

export type TeamDeleteUserBody = {
  userId: string
}

export const teamDeleteUser: DeleteRequest<TeamDeleteUserParams, TeamDeleteUserBody> = async (req, res) => {
  try {
    const {teamId} = req.params
    const {userId} = req.body

    const data = await UserTeamModel.findOne({
      where: {
        teamId,
        userId
      }
    })

    if (!data) return res.sendStatus(httpStatus.NOT_FOUND)

    await data.destroy()

    res.sendStatus(httpStatus.OK)

  } catch (e) {
    internalErrorHandler(res, e)
  }
}
