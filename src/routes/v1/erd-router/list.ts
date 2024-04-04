import httpStatus from "http-status";
import {ErdModel, IErdModel} from "../../../sequelize-models/erd-api/Erd.model";
import {WhereOptions} from "sequelize";
import {TeamModel} from "../../../sequelize-models/erd-api/Team.model";
import {UserTeamModel} from "../../../sequelize-models/erd-api/UserTeam.model";
import {PaginationRequestHandler} from "../../../middleware/pagination";

interface RequestParams {}

interface RequestQuery {
  teamId?: string[]
}

export const list: PaginationRequestHandler<RequestParams, RequestQuery> = async (req, res) => {
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
    })

    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(httpStatus.INTERNAL_SERVER_ERROR)
  }
}
