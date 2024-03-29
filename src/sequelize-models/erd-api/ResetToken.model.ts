import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUserModel, UserModel} from "./User.model";

export interface IResetTokenModel {
  id: string
  token: string
  expiresAt: Date | any
  createdAt: Date | any

  //Foreign key
  userId: string

  //Relations
  user?: IUserModel
}

export interface ICResetTokenModel extends Optional<IResetTokenModel, 'id' | 'createdAt'>{}

@Table({
  modelName: 'ResetTokenModel',
  tableName: 'ResetToken',
  timestamps: true,
  updatedAt: false
})
export class ResetTokenModel extends Model<IResetTokenModel, ICResetTokenModel> {
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
