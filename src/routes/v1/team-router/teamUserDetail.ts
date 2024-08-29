import {UserTeamModel} from "../../../sequelize-models/erd-api/UserTeam.model";
import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {DeleteRequest} from "../../../types/types";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../../constants/common";

export type TeamUserDetailParams = {
  teamId: string
  userId: string
}

export const teamUserDetail: DeleteRequest<TeamUserDetailParams> = async (req, res) => {
  try {
    const {teamId, userId} = req.params

    const data = await UserTeamModel.findOne({
      where: {
        teamId,
        userId
      }
    })

    if (!data) {
      return errorHandler(
        res,
        HttpStatusCode.NotFound,
        COMMON.API_ERRORS.NOT_FOUND
      )
    }

    res.json(data)

  } catch (e) {
    internalErrorHandler(res, e)
  }
}
