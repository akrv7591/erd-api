import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUser, User} from "./User.model";
import {EmailVerification} from "../../constants/emailVerification";


export interface IEmailVerificationToken {
  id: string
  token: string
  expiresAt: Date | any
  createdAt: Date | any
  type: EmailVerification.Type

  //Foreign key
  userId: string

  //Relations
  user?: IUser
}

export interface ICEmailVerificationToken extends Optional<IEmailVerificationToken, 'id' | 'createdAt'>{}

@Table({
  modelName: 'EmailVerificationToken',
  tableName: 'EmailVerificationToken',
  timestamps: true,
  updatedAt: false
})
export class EmailVerificationToken extends Model<IEmailVerificationToken, ICEmailVerificationToken> {
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
  declare token: string

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare expiresAt: Date

  @Column({
    type: DataType.ENUM(EmailVerification.Type.EMAIL, EmailVerification.Type.TEAM_INVITATION)
  })
  declare type: EmailVerification.Type

  // Foreign keys
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare userId: string

  // Relations
  @BelongsTo(() => User)
  declare user: User
}
