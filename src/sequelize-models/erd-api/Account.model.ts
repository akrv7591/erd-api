import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUserModel, UserModel} from "./User.model";

export interface IAccountModel {
  id: string
  type: string
  provider: string
  providerAccountId: string
  refreshToken: string | null
  accessToken: string | null
  expiresAt: Date
  tokenType: string | null
  scope: string | null
  idToken: string | null
  sessionState: string | null
  createdAt: Date | any

  //Foreign key
  userId: string

  //Relations
  user?: IUserModel
}

export interface ICAccountModel extends Optional<IAccountModel, 'id' | 'createdAt' | 'refreshToken' | 'accessToken' | 'tokenType' | 'scope' | 'idToken' | 'sessionState'>{}

@Table({
  modelName: 'AccountModel',
  tableName: 'Account',
  timestamps: true,
  updatedAt: false
})
export class AccountModel extends Model<IAccountModel, ICAccountModel> {
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
  declare type: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare provider: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare providerAccountId: string

  @Column({
    type: DataType.STRING,
  })
  declare refreshToken: string | null

  @Column({
    type: DataType.STRING,
  })
  declare accessToken: string | null

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare expiresAt: Date

  @Column({
    type: DataType.STRING,
  })
  declare tokenType: string | null

  @Column({
    type: DataType.STRING,
  })
  declare scope: string | null

  @Column({
    type: DataType.STRING,
  })
  declare idToken: string | null

  @Column({
    type: DataType.STRING,
  })
  declare sessionState: string | null

  // Foreign keys
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  declare userId: string

  // Relations
  @BelongsTo(() => UserModel)
  declare user: UserModel
}
