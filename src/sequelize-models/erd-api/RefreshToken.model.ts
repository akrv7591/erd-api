import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUserModel, UserModel} from "./User.model";

export interface IRefreshTokenModel {
  id: string
  token: string
  createdAt: Date | any

  //Foreign key
  userId: string

  //Relations
  user?: IUserModel
}

export interface ICRefreshTokenModel extends Optional<IRefreshTokenModel, 'id' | 'createdAt'>{}

@Table({
  modelName: 'RefreshTokenModel',
  tableName: 'RefreshToken',
  timestamps: true,
  updatedAt: false
})
export class RefreshTokenModel extends Model<IRefreshTokenModel, ICRefreshTokenModel> {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => createId()
  })
  declare id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare token: string

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
