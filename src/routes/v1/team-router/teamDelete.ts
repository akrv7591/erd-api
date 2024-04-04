import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import httpStatus from "http-status";
import {TeamModel} from "../../../sequelize-models/erd-api/Team.model";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../../constants/common";
import {DeleteRequest} from "../../../types/types";

export type TeamDetailOrDeleteParams = {
  teamId: string
}

export const teamDelete: DeleteRequest<TeamDetailOrDeleteParams> = async (req, res) => {
  try {
    const {teamId} = req.params

    const deleted = await TeamModel.destroy({
      where: {
        id: teamId
      }
    })

    if (!deleted) {
      return errorHandler(res, HttpStatusCode.NotFound, COMMON.API_ERRORS.NOT_FOUND)
    }

    res.sendStatus(httpStatus.OK)

  } catch (e: any) {
    internalErrorHandler(res, e)
  }
}
