import express from "express";
import logger from "../../../middleware/logger";
import httpStatus from "http-status";
import {Team} from "../../../sequelize-models/erd-api/Team.model";
import {UserTeam} from "../../../sequelize-models/erd-api/UserTeam.model";

export const list = async (req: express.Request, res: express.Response) => {
  try {
    const list = await Team.findAndCountAll({
      ...req.pagination,
      where: {
        ...req.pagination?.where,
      },
      include: [{
        model: UserTeam,
        required: true,
        attributes: [],
        where: {
          userId: req.authorizationUser?.id,
          pending: false
        }
      }]
    })

    res.json(list)
  } catch (e) {
    logger.error(e)
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
