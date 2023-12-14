import {RequestHandler} from "express";
import httpStatus from "http-status";
import {Erd} from "../../../sequelize-models/erd-api/Erd.model";
import {Includeable} from "sequelize";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {Team} from "../../../sequelize-models/erd-api/Team.model";

export const detail: RequestHandler<{erdId: string}> = async (req, res) => {
  const include: Includeable[] = []

  include.push({
    model: Team,
  })
  include.push({
    model: User,
  })

  try {
    const data = await Erd.findByPk(req.params.erdId, {
      include,
    })

    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(httpStatus.INTERNAL_SERVER_ERROR)
  }
}
