import express from "express";
import logger from "../../../utils/logger";
import httpStatus from "http-status";
import {TeamModel} from "../../../sequelize-models/erd-api/Team.model";
import {UserTeamModel} from "../../../sequelize-models/erd-api/UserTeam.model";

export const teamList = async (req: express.Request, res: express.Response) => {
  try {
    const list = await TeamModel.findAndCountAll({
      ...req.pagination,
      where: {
        ...req.pagination?.where,
      },
      include: [{
        model: UserTeamModel,
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
