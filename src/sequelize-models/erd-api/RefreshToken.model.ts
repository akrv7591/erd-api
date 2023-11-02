import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUser, User} from "./User.model";

export interface IRefreshToken {
  id: string
  token: string
  createdAt: Date | any

  //Foreign key
  userId: string

  //Relations
  user?: IUser
}

export interface ICRefreshToken extends Optional<IRefreshToken, 'id' | 'createdAt'>{}

@Table({
  modelName: 'RefreshToken',
  tableName: 'RefreshToken',
  timestamps: true,
  updatedAt: false
})
export class RefreshToken extends Model<IRefreshToken, ICRefreshToken> {
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
