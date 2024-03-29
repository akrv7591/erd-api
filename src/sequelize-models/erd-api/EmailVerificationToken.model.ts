import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUserModel, UserModel} from "./User.model";
import {EMAIL_VERIFICATION} from "../../constants/emailVerification";


export interface IEmailVerificationTokenModel {
  id: string
  token: string
  expiresAt: Date | any
  createdAt: Date | any
  type: EMAIL_VERIFICATION.TYPES

  //Foreign key
  userId: string

  //Relations
  user?: IUserModel
}

export interface ICEmailVerificationTokenModel extends Optional<IEmailVerificationTokenModel, 'id' | 'createdAt'>{}

@Table({
  modelName: 'EmailVerificationTokenModel',
  tableName: 'EmailVerificationToken',
  timestamps: true,
  updatedAt: false
})
export class EmailVerificationTokenModel extends Model<IEmailVerificationTokenModel, ICEmailVerificationTokenModel> {
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
    type: DataType.ENUM(EMAIL_VERIFICATION.TYPES.EMAIL, EMAIL_VERIFICATION.TYPES.TEAM_INVITATION)
  })
  declare type: EMAIL_VERIFICATION.TYPES

  // Foreign keys
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare userId: string

  // Relations
  @BelongsTo(() => UserModel)
  declare user: UserModel
}
