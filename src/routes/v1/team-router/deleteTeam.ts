import {RequestHandler} from "express";
import {internalErrorHandler} from "../../../middleware/internalErrorHandler";
import {isCuid} from "@paralleldrive/cuid2";
import httpStatus from "http-status";
import {Team} from "../../../sequelize-models/erd-api/Team.model";

export const deleteTeam: RequestHandler = async (req, res) => {
  try {
    const {teamId} = req.params

    if (!teamId || !isCuid(teamId)) return res.sendStatus(httpStatus.BAD_REQUEST)

    const deleted = await Team.destroy({
      where: {
        id: teamId
      }
    })

    res.sendStatus(deleted? httpStatus.OK: httpStatus.NOT_FOUND)

  } catch (e: any) {
    internalErrorHandler(e, req, res)
  }
}
