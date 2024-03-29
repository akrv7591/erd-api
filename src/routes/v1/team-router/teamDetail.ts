import {RequestHandler} from "express";
import {errorHandler, internalErrorHandler} from "../../../middleware/errorHandler";
import {TeamModel} from "../../../sequelize-models/erd-api/Team.model";
import {TeamDetailOrDeleteParams} from "./teamDelete";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../../constants/common";

export const teamDetail: RequestHandler<TeamDetailOrDeleteParams> = async (req, res) => {
  try {
    const team = await TeamModel.findByPk(req.params.teamId)

    if (!team) {
      return errorHandler(req, res, HttpStatusCode.NotFound, COMMON.API_ERRORS.NOT_FOUND)
    }

    res.json(team)

  } catch (e: any) {
    internalErrorHandler(e, req, res)
  }
}
