import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {IUserModel, UserModel} from "./User.model";
import {ITeamModel, TeamModel} from "./Team.model";
import {ROLE} from "../../enums/role";
import {EmailVerificationTokenModel} from "./EmailVerificationToken.model";
import {sendUserInvitationEmail} from "../../utils/email/sendUserInvitation";
import {EMAIL_VERIFICATION} from "../../constants/emailVerification";

export interface IUserTeamModel {
  //Composite primary keys
  userId: string
  teamId: string
  role: ROLE
  pending: boolean

  createdAt: Date
  updatedAt: Date

  //Relations
  user?: IUserModel
  team?: ITeamModel
}


export interface ICUserTeamModel extends Optional<IUserTeamModel, 'createdAt' | 'updatedAt'> {
}

@Table({
  modelName: 'UserTeamModel',
  tableName: 'UserTeam',
  timestamps: true,
  hooks: {
    async afterCreate(attributes: UserTeamModel, options) {
      const createUserTeamInvitation = async () => {
        await EmailVerificationTokenModel.create({
          type: EMAIL_VERIFICATION.TYPES.TEAM_INVITATION,
          userId: attributes.userId,
          token: attributes.teamId,
          expiresAt: new Date(Date.now() + 86400000) // Token expires in 1 day
        })
        const [user, team] = await Promise.all([
          UserModel.findByPk(attributes.userId),
          TeamModel.findByPk(attributes.teamId)
        ])
        if (user && team) {
          sendUserInvitationEmail(user, team)
        }
      }
      if (options.transaction) {
        options.transaction.afterCommit(async () => {
          await createUserTeamInvitation()
        })
      } else {
        await createUserTeamInvitation()
      }
    }
  }
})
export class UserTeamModel extends Model<IUserTeamModel, ICUserTeamModel> {
  //Composite primary keys
  @PrimaryKey
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare userId: string

  @PrimaryKey
  @ForeignKey(() => TeamModel)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare teamId: string

  @Column({
    type: DataType.ENUM(ROLE.READ, ROLE.WRITE, ROLE.ADMIN),
    allowNull: false,
    defaultValue: ROLE.READ
  })
  declare role: ROLE

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  declare pending: boolean

  @BelongsTo(() => TeamModel)
  declare team: TeamModel

  @BelongsTo(() => UserModel)
  declare user: UserModel
}
