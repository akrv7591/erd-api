import {RequestHandler} from "express";
import httpStatus from "http-status";
import {Erd} from "../../../sequelize-models/erd-api/Erd.model";
import {Includeable} from "sequelize";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {Team} from "../../../sequelize-models/erd-api/Team.model";

export const list: RequestHandler = async (req, res) => {
  const teamId = req.query['teamId']
  const include: Includeable[] = []

  if (teamId) {
    include.push({
      model: User,
      required: true,
      include: [{
        model: Team,
        required: true,
        where: {
          id: teamId
        }
      }]
    })
  }

  try {
    const data = await Erd.findAndCountAll({
      ...req.pagination,
      include
    })

    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(httpStatus.INTERNAL_SERVER_ERROR)

  }
}
