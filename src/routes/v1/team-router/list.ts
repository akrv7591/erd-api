import express from "express";
import logger from "../../../middleware/logger";
import httpStatus from "http-status";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {Team} from "../../../sequelize-models/erd-api/Team.model";

export const list = async (req: express.Request, res: express.Response) => {
  try {
    const data = {
      count: 0,
      rows: [] as Team[]
    }

    const user = await User.findByPk(req.authorizationUser?.id, {
      include: [{
        model: Team,
        required: true,
      }]
    })

    if (user) {
      data.count = user.teams.length
      // @ts-ignore
      data.rows = user.teams.filter(team => !team.UserTeam.pending)
    }


    res.json(data)
  } catch (e) {
    logger.error(e)
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
