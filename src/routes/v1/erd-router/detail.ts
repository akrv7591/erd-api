import {RequestHandler} from "express";
import httpStatus from "http-status";
import {ErdModel} from "../../../sequelize-models/erd-api/Erd.model";
import {Includeable} from "sequelize";
import {TeamModel} from "../../../sequelize-models/erd-api/Team.model";

export const detail: RequestHandler<{ erdId: string }> = async (req, res) => {
  const include: Includeable[] = []

  include.push({
    model: TeamModel,
  })


  try {
    const data = await ErdModel.findByPk(req.params.erdId, {
      include,
    })

    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(httpStatus.INTERNAL_SERVER_ERROR)
  }
}
