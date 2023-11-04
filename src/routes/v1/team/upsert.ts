import express from "express";
import logger from "../../../middleware/logger";
import httpStatus from "http-status";
import {matchedData} from "express-validator"
import {ICTeam, Team} from "../../../sequelize-models/erd-api/Team.model";

export const upsert = async (req: express.Request, res: express.Response) => {
  try {
    const data = matchedData(req) as ICTeam

    const [team, created] = await Team.upsert(data)

    res.status(created? httpStatus.CREATED: 200).json(team)


  } catch (e) {
    logger.error(e)
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
  }
}

