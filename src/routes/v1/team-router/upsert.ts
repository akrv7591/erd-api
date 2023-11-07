import express from "express";
import logger from "../../../middleware/logger";
import httpStatus from "http-status";
import {matchedData} from "express-validator"
import {ICTeam, Team} from "../../../sequelize-models/erd-api/Team.model";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {Op} from "sequelize";
import {UserTeam} from "../../../sequelize-models/erd-api/UserTeam.model";

export const upsert = async (req: express.Request, res: express.Response) => {
  try {
    const {users, ...data} = matchedData(req) as ICTeam


    const [team, created] = await Team.upsert(data)

    if (created) {
      const user = await User.findByPk(req.authorizationUser?.id)

      if (user) await UserTeam.create({
        isAdmin: true,
        teamId: team.id,
        userId: user.id
      })
    }

    const usersToInvite = await User.findAll({
      where: {
        email: users as unknown as string[]
      },
      include: [
        {
          model: Team,
          where: {
            id: {
              [Op.not]: team.id
            }
          },
          required: true
        }
      ]
    })

    console.log("\nUSERS TO INVITE")
    console.table(usersToInvite.map(user => user.toJSON()))

    res.status(created? httpStatus.CREATED: httpStatus.OK).json(team)


  } catch (e) {
    logger.error(e)
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
  }
}

