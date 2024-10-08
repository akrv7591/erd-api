import {ErdModel, IErdModel} from "../../../sequelize-models/erd-api/Erd.model";
import {WhereOptions} from "sequelize";
import {TeamModel} from "../../../sequelize-models/erd-api/Team.model";
import {UserTeamModel} from "../../../sequelize-models/erd-api/UserTeam.model";
import {ListRequest} from "../../../types/types";
import {internalErrorHandler} from "../../../utils/errorHandler";

interface RequestParams {}

interface RequestQuery {
  teamId?: string[]
}

export const erdList: ListRequest<RequestParams, RequestQuery> = async (req, res) => {
  const teamId = req.query.teamId

  const where: WhereOptions<IErdModel> = {}

  if (teamId) {
    where.teamId = teamId
  } else {
    const userTeamIds = await TeamModel.findAll({
      attributes: ['id'],
      include: [{
        model: UserTeamModel,
        required: true,
        where: {
          userId: req.authorizationUser?.id
        },
        attributes: [],
      }]
    })

    where.teamId = userTeamIds.map(t => t.id)
  }

  try {
    const data = await ErdModel.findAndCountAll({
      ...req.pagination,
      where: {
        ...req.pagination?.where,
        ...where,
      },
      attributes: {
        exclude: ["data"]
      }
    })

    res.json(data)
  } catch (e) {
    internalErrorHandler(res, e)
  }
}
