import {RequestHandler} from "express";
import httpStatus from "http-status";
import {Erd} from "../../../sequelize-models/erd-api/Erd.model";
import {Includeable} from "sequelize";
// import {User} from "../../../sequelize-models/erd-api/User.model";
import {Team} from "../../../sequelize-models/erd-api/Team.model";
import {UserErd} from "../../../sequelize-models/erd-api/UserErd.model";
// import {UserErd} from "../../../sequelize-models/erd-api/UserErd.model";

export const list: RequestHandler = async (req, res) => {
  const teamId = req.query['teamId']
  const include: Includeable[] = []

  include.push({
    model: Team,
    required: !!teamId,
    ...teamId && {
      where: {
        id: teamId,
      }
    }
  })
  // include.push({
  //   model: User,
  // })

  include.push({
    model: UserErd,
    required: true,
    where: {
      userId: req.authorizationUser?.id,
      canRead: true
    },
  })


  try {
    const data = await Erd.findAndCountAll({
      ...req.pagination,
      include,
    })

    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(httpStatus.INTERNAL_SERVER_ERROR)
  }
}
