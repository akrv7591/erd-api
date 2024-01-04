import {RequestHandler} from "express";
import {errorHandler} from "../../../middleware/errorHandler";
import {isCuid} from "@paralleldrive/cuid2";
import httpStatus from "http-status";
import {Team} from "../../../sequelize-models/erd-api/Team.model";

export const teamDetail: RequestHandler = async (req, res) => {
  try {
    const {teamId} = req.params

    if (!teamId || !isCuid(teamId)) return res.sendStatus(httpStatus.BAD_REQUEST)

    const team = await Team.findByPk(teamId)

    if (!team) return res.sendStatus(httpStatus.NOT_FOUND)


    res.json(team)

  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
