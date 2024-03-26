import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {IUser, User} from "./User.model";
import {ITeam, Team} from "./Team.model";
import {ROLE} from "../../enums/role";
import {EmailVerificationToken} from "./EmailVerificationToken.model";
import {sendUserInvitationEmail} from "../../utils/email/sendUserInvitation";
import {EmailVerification} from "../../constants/emailVerification";

export interface IUserTeam {
  //Composite primary keys
  userId: string
  teamId: string
  role: ROLE
  pending: boolean

  createdAt: Date
  updatedAt: Date

  //Relations
  user?: IUser
  team?: ITeam
}


export interface ICUserTeam extends Optional<IUserTeam, 'createdAt' | 'updatedAt'> {
}

@Table({
  modelName: 'UserTeam',
  tableName: 'UserTeam',
  timestamps: true,
  hooks: {
    async afterCreate(attributes: UserTeam, options) {
      const createUserTeamInvitation = async () => {
        await EmailVerificationToken.create({
          type: EmailVerification.Type.TEAM_INVITATION,
          userId: attributes.userId,
          token: attributes.teamId,
          expiresAt: new Date(Date.now() + 86400000) // Token expires in 1 day
        })
        const [user, team] = await Promise.all([
          User.findByPk(attributes.userId),
          Team.findByPk(attributes.teamId)
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
export class UserTeam extends Model<IUserTeam, ICUserTeam> {
  //Composite primary keys
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare userId: string

  @PrimaryKey
  @ForeignKey(() => Team)
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

  @BelongsTo(() => Team)
  declare team: Team
}
