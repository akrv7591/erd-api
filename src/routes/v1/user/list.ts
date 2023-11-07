import express from "express";
import httpStatus from 'http-status'
import {User} from "../../../sequelize-models/erd-api/User.model";
import {Team} from "../../../sequelize-models/erd-api/Team.model";


export const list = async (req: express.Request, res: express.Response) => {
  try {
    const teamId = req.query['teamId']

    if (!teamId) return res.status(httpStatus.BAD_REQUEST).json({message: "teamId is required"})

    const data = await User.findAndCountAll({
      ...req.pagination,
      include: [{
        model: Team,
        where: {
          id: teamId
        },
        required: true
      }]
    })

    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

