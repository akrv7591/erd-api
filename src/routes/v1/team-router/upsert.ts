import express from "express";
import httpStatus from "http-status";
import {matchedData} from "express-validator"
import {ICTeam, Team} from "../../../sequelize-models/erd-api/Team.model";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {UserTeam} from "../../../sequelize-models/erd-api/UserTeam.model";
import {ROLE} from "../../../enums/role";
import {erdSequelize} from "../../../sequelize-models/erd-api";
import {Transaction} from "sequelize";
import logger from "../../../middleware/logger";

export const upsert = async (req: express.Request, res: express.Response) => {
  let transaction: Transaction | null = null
  try {
    transaction = await erdSequelize.transaction()
    let {users, ...data} = matchedData(req) as ICTeam
    const [team, created] = await Team.upsert(data, {transaction})

    const user = await User.findByPk(req.authorizationUser?.id, {transaction})

    if (created) {
      if (user) await UserTeam.create({
        teamId: team.id,
        userId: user.id,
        role: ROLE.ADMIN,
        pending: false,
      }, {transaction, hooks: false})
    }

    if (user) {
      const invitedUsers = await Promise.all((users || []).filter(user => user.id !== req.authorizationUser?.id).map(user => User.upsert({email: user.email, isPasswordSet: false}, {transaction})))//

      await Promise.all(invitedUsers.map(async ([u]) => {
        const user = await User.findOne({where: {email: u.email}, transaction})

        const userTeam = await UserTeam.findOne({
          where: {
            userId: user?.id,
            teamId: team.id
          }
        })

        const role = users!.find(u => u.email === user!.email)?.UserTeam?.role!

        if (!userTeam) {
          return UserTeam.create({
            teamId: team.id,
            userId: user!.id,
            role,
            pending: true
          }, {transaction})
        } else {
          userTeam.role = role

          return userTeam.update({role}, {transaction})
        }

      }))
    }

    await transaction.commit()

    res.status(created ? httpStatus.CREATED : httpStatus.OK).json(team)

  } catch (e) {
    logger.error(e)
    await transaction?.rollback()
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
  }
}

