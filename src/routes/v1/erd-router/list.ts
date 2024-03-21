import {RequestHandler} from "express";
import httpStatus from "http-status";
import {Erd, IErd} from "../../../sequelize-models/erd-api/Erd.model";
import {WhereOptions} from "sequelize";
import {Team} from "../../../sequelize-models/erd-api/Team.model";
import {UserTeam} from "../../../sequelize-models/erd-api/UserTeam.model";

export const list: RequestHandler = async (req, res) => {
  const teamId = req.query['teamId'] as string[]

  const where: WhereOptions<IErd> = {}

  if (teamId) {
    where.teamId = teamId
  } else {
    const userTeamIds = await Team.findAll({
      attributes: ['id'],
      include: [{
        model: UserTeam,
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
    const data = await Erd.findAndCountAll({
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
