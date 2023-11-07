import express from "express";
import logger from "../../../middleware/logger";
import httpStatus from "http-status";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {Team} from "../../../sequelize-models/erd-api/Team.model";

export const list = async (req: express.Request, res: express.Response) => {
  try {
    const data = await Team.findAndCountAll({
      ...req.pagination,
      include: {
        model: User,
        required: true,
        where: {
          id: req.authorizationUser?.id
        }
      }
    })

    res.json(data)
  } catch (e) {
    logger.error(e)
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
