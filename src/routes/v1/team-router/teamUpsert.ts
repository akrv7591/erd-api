import {Response, Request} from "express";
import httpStatus from "http-status";
import {matchedData} from "express-validator"
import {ICTeamModel, TeamModel} from "../../../sequelize-models/erd-api/Team.model";
import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import {UserTeamModel} from "../../../sequelize-models/erd-api/UserTeam.model";
import {ROLE} from "../../../enums/role";
import {erdSequelize} from "../../../sequelize-models/erd-api";
import {Transaction} from "sequelize";
import logger from "../../../middleware/logger";

export type PutTeamRequestBody = ICTeamModel & {
  id: string
}

export const teamUpsert = async (req: Request<{}, PutTeamRequestBody>, res: Response) => {
  let transaction: Transaction | null = null
  try {
    transaction = await erdSequelize.transaction()
    let {users, ...data} = matchedData(req) as ICTeamModel
    const [team, created] = await TeamModel.upsert(data, {transaction})

    const user = await UserModel.findByPk(req.authorizationUser?.id, {transaction})

    if (created) {
      if (user) await UserTeamModel.create({
        teamId: team.id,
        userId: user.id,
        role: ROLE.ADMIN,
        pending: false,
      }, {transaction, hooks: false})
    }

    if (user) {
      const invitedUsers = await Promise.all((users || []).filter(user => user.id !== req.authorizationUser?.id).map(user => UserModel.upsert({email: user.email, isPasswordSet: false}, {transaction})))//

      await Promise.all(invitedUsers.map(async ([u]) => {
        const user = await UserModel.findOne({where: {email: u.email}, transaction})

        const userTeam = await UserTeamModel.findOne({
          where: {
            userId: user?.id,
            teamId: team.id
          }
        })

        const role = users!.find(u => u.email === user!.email)?.UserTeam?.role!

        if (!userTeam) {
          return UserTeamModel.create({
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

