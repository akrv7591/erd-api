import {RequestHandler} from "express";
import {UserTeamModel} from "../../../sequelize-models/erd-api/UserTeam.model";
import httpStatus from "http-status";
import {internalErrorHandler} from "../../../utils/errorHandler";

export type TeamDeleteUserRequestParams = {
  teamId: string
}

export type TeamDeleteUserRequestBody = {
  userId: string
}

export const teamDeleteUser: RequestHandler<TeamDeleteUserRequestParams, {}, TeamDeleteUserRequestBody> = async (req, res) => {
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
    internalErrorHandler(e, req, res)
  }
}
