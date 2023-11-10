import {Optional} from "sequelize";
import {Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
// import {createId} from "@paralleldrive/cuid2";
import {IUser, User} from "./User.model";
import {Erd, IErd} from "./Erd.model";

export interface IUserErd {
  // id: string
  createdAt: Date
  updatedAt: Date
  isAdmin: boolean
  canEdit: boolean

  //Foreign keys
  userId: string
  erdId: string

  //Relations
  user?: IUser
  erd?: IErd
}

export interface ICUserErd extends Optional<IUserErd, 'createdAt' | 'updatedAt'> {
}

@Table({
  modelName: 'UserErd',
  tableName: 'UserErd',
  timestamps: true,
})
export class UserErd extends Model<IUserErd, ICUserErd> {
  // @PrimaryKey
  // @Column({
  //   type: DataType.STRING,
  //   allowNull: false,
  //   unique: true,
  //   defaultValue: () => createId()
  // })
  // declare id: string;

  //Foreign keys
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare userId: string

  @PrimaryKey
  @ForeignKey(() => Erd)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare erdId: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  declare isAdmin: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  declare canEdit: boolean

  //Foreign keys
  // @ForeignKey(() => User)
  // @Column({
  //   type: DataType.STRING,
  //   allowNull: false
  // })
  // declare userId: string
  //
  // @ForeignKey(() => Erd)
  // @Column({
  //   type: DataType.STRING,
  //   allowNull: false
  // })
  // declare erdId: string

}
