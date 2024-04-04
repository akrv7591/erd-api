import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {TeamModel} from "../../../sequelize-models/erd-api/Team.model";
import {TeamDetailOrDeleteParams} from "./teamDelete";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../../constants/common";
import {GetRequest} from "../../../types/types";

export const teamDetail: GetRequest<TeamDetailOrDeleteParams> = async (req, res) => {
  try {
    const team = await TeamModel.findByPk(req.params.teamId)

    if (!team) {
      return errorHandler(res, HttpStatusCode.NotFound, COMMON.API_ERRORS.NOT_FOUND)
    }

    res.json(team)

  } catch (e: any) {
    internalErrorHandler(res, e)
  }
}
