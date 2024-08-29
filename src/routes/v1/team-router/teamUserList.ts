import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import {TeamModel} from "../../../sequelize-models/erd-api/Team.model";
import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../../constants/common";
import {ListRequest} from "../../../types/types";

export type TeamUserListParams = {
  teamId: string
}

export type TeamUserListQuery = {
}

export const teamUserList: ListRequest<TeamUserListParams, TeamUserListQuery> = async (req, res) => {
  try {
    const data = await UserModel.findAndCountAll({
      include: [{
        model: TeamModel,
        where: {
          id: req.params.teamId
        },
        required: true,
        attributes: []
      }]
    })

    if (!data) {
      return errorHandler(res, HttpStatusCode.NotFound, COMMON.API_ERRORS.NOT_FOUND)
    }

    res.json(data)

  } catch (e) {
    internalErrorHandler(res, e)
  }
}
