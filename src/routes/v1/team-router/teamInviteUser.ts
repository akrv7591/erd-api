import {PostRequest} from "../../../types/types";
import {ROLE} from "../../../enums/role";
import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {UserTeamModel} from "../../../sequelize-models/erd-api/UserTeam.model";
import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import {TeamModel} from "../../../sequelize-models/erd-api/Team.model";
import {TEAM} from "../../../constants/team";
import {HttpStatusCode} from "axios";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../../sequelize-models/erd-api";

export interface TeamUserInviteParams {
  teamId: string
}

export interface TeamUserInviteBody {
  email: string
  role: ROLE
}

export const teamInviteUser: PostRequest<TeamUserInviteParams, TeamUserInviteBody> = async (req, res) => {
  let transaction: Transaction | undefined

  try {
    const {teamId} = req.params
    const {email, role} = req.body

    const team = await TeamModel.findByPk(teamId)

    if (!team) {
      return errorHandler(res, HttpStatusCode.NotFound, TEAM.API_ERRORS.NOT_FOUND)
    }

    transaction = await erdSequelize.transaction()

    // Search for existing user
    let user = await UserModel.findOne({
      where: {
        email
      },
      transaction
    })

    // If existing user is not found
    if (!user) {

      // Create temp user with given email
      const tempName = email.split("@")[0] || ""
      user = await UserModel.create({
        email,
        name: tempName,
        isPasswordSet: false
      }, {transaction})
    }

    // Create pending userTeam relation
    await UserTeamModel.create({
      teamId: team.id,
      userId: user.id,
      role,
      pending: true
    }, {transaction})

    await transaction.commit()

    res.status(HttpStatusCode.Created).json(user)

  } catch (e) {
    await transaction?.rollback()
    internalErrorHandler(res, e)
  }
}
