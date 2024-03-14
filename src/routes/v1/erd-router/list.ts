import {RequestHandler} from "express";
import httpStatus from "http-status";
import {Erd} from "../../../sequelize-models/erd-api/Erd.model";

export const list: RequestHandler = async (req, res) => {
  const teamId = req.query['teamId'] as string[]

  if (!teamId || !Array.isArray(teamId)) return res.sendStatus(httpStatus.BAD_REQUEST)


  try {
    const data = await Erd.findAndCountAll({
      ...req.pagination,
      where: {
        ...req.pagination?.where,
        teamId
      },
    })

    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(httpStatus.INTERNAL_SERVER_ERROR)
  }
}
