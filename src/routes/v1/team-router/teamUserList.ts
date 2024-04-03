import {RequestHandler} from "express";
import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import {TeamModel} from "../../../sequelize-models/erd-api/Team.model";
import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../../constants/common";

export type TeamUserListRequestParams = {
  teamId: string
}

export const teamUserList: RequestHandler<TeamUserListRequestParams> = async (req, res) => {
  try {
    const data = await UserModel.findAll({
      include: [{
        model: TeamModel,
        where: {
          id: req.params.teamId
        },
        required: true,
      }]
    })

    if (!data) {
      return errorHandler(req, res, HttpStatusCode.NotFound, COMMON.API_ERRORS.NOT_FOUND)
    }

    res.json(data)

  } catch (e) {
    internalErrorHandler(e, req, res)
  }
}
