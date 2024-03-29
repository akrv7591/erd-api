import {CreateOptions, Optional} from "sequelize";
import {BelongsToMany, Column, DataType, HasMany, HasOne, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {AccountModel, IAccountModel} from "./Account.model";
import {EmailVerificationTokenModel, IEmailVerificationTokenModel} from "./EmailVerificationToken.model";
import {IRefreshTokenModel, RefreshTokenModel} from "./RefreshToken.model";
import {IResetTokenModel, ResetTokenModel} from "./ResetToken.model";
import {ICTeamModel, ITeamModel, TeamModel} from "./Team.model";
import {ICUserTeamModel, IUserTeamModel, UserTeamModel} from "./UserTeam.model";
import {ROLE} from "../../enums/role";
import {IMemoModel, MemoModel} from "./Memo.mode";
import {IProfileModel, ProfileModel} from "./Profile.model";


export interface IUserModel {
  id: string
  name: string
  email: string
  password: string | null
  emailVerified?: Date | null
  isPasswordSet: boolean
  createdAt: Date
  updatedAt: Date

  //Relations
  accounts?: IAccountModel[]
  emailVerificationTokens?: IEmailVerificationTokenModel[]
  refreshTokens?: IRefreshTokenModel[]
  resetTokens?: IResetTokenModel[]
  teams?: ITeamModel[]
  memos?: IMemoModel[]
  profile?: IProfileModel
  UserTeam?: IUserTeamModel
}

export interface ICUserModel extends Optional<IUserModel, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'name'>{}

@Table({
  modelName: 'UserModel',
  tableName: 'User',
  timestamps: true,
  defaultScope: {
    attributes: {
      exclude: ['password']
    }
  },
  hooks: {
    async afterCreate(user: UserModel, options) {
      const teamCreateOptions: CreateOptions<ICTeamModel> = {}
      const userTeamCreateOptions: CreateOptions<ICUserTeamModel> = {
        hooks: false
      }

      if (options.transaction) {
        teamCreateOptions.transaction = options.transaction
        userTeamCreateOptions.transaction = options.transaction
      }

      const team = await TeamModel.create({
        name: "Private",
      }, teamCreateOptions)

      await UserTeamModel.create({
        userId: user.id,
        teamId: team.id,
        role: ROLE.ADMIN,
        pending: false
      }, userTeamCreateOptions)
    }
  }
})
export class UserModel extends Model<IUserModel, ICUserModel> {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => createId()
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: ""
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
  })
  declare password: string | null

  @Column({
    type: DataType.DATE
  })
  declare emailVerified?: Date | null

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  declare isPasswordSet: boolean

  //Relations
  @HasMany(() => AccountModel, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  declare accounts: AccountModel[]

  @HasMany(() => EmailVerificationTokenModel, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  declare emailVerificationTokens: EmailVerificationTokenModel[]

  @HasMany(() => RefreshTokenModel, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  declare refreshTokens: RefreshTokenModel[]

  @HasMany(() => ResetTokenModel, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  declare resetTokens: ResetTokenModel[]

  @HasMany(() => MemoModel, {
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  })
  declare memos: MemoModel[]

  @HasOne(() => ProfileModel, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare profile: ProfileModel

  @BelongsToMany(() => TeamModel, () => UserTeamModel)
  declare teams: TeamModel[]

  public toJWTPayload() {
    return {
      id: this.id,
    };
  }
}
