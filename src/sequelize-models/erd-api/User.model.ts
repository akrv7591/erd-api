import {Optional} from "sequelize";
import {BelongsToMany, Column, DataType, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {Account, IAccount} from "./Account.model";
import {EmailVerificationToken, IEmailVerificationToken} from "./EmailVerificationToken.model";
import {IRefreshToken, RefreshToken} from "./RefreshToken.model";
import {IResetToken, ResetToken} from "./ResetToken.model";
import {ITeam, Team} from "./Team.model";
import {UserTeam} from "./UserTeam.model";
import {Erd} from "./Erd.model";
import {UserErd} from "./UserErd.model";

export interface IUser {
  id: string
  name: string
  email: string
  password: string | null
  emailVerified?: Date | null
  createdAt: Date
  updatedAt: Date

  //Relations
  accounts?: IAccount[]
  emailVerificationTokens?: IEmailVerificationToken[]
  refreshTokens?: IRefreshToken[]
  resetTokens?: IResetToken[]
  teams?: ITeam[]
}

export interface ICUser extends Optional<IUser, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified'>{}

@Table({
  modelName: 'User',
  tableName: 'User',
  timestamps: true,
  defaultScope: {
    attributes: {
      exclude: ['password']
    }
  }
})
export class User extends Model<IUser, ICUser> {
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
    allowNull: false
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

  //Relations
  @HasMany(() => Account, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  declare accounts: Account[]

  @HasMany(() => EmailVerificationToken, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  declare emailVerificationToken: EmailVerificationToken[]

  @HasMany(() => RefreshToken, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  declare refreshTokens: RefreshToken[]

  @HasMany(() => ResetToken, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  declare resetTokens: ResetToken[]

  @BelongsToMany(() => Team, () => UserTeam)
  declare teams: Team[]

  @BelongsToMany(() => Erd, () => UserErd)
  declare erds: Erd[]

  public toJWTPayload() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
