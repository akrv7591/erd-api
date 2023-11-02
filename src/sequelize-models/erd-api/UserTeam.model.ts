import {Optional} from "sequelize";
import {Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUser, User} from "./User.model";
import {ITeam, Team} from "./Team.model";

export interface IUserTeam {
  id: string
  createdAt: Date
  updatedAt: Date
  isAdmin: number

  //Foreign keys
  userId: string
  teamId: string

  //Relations
  user?: IUser
  team?: ITeam
}

export interface ICUserTeam extends Optional<IUserTeam, 'id' | 'createdAt' | 'updatedAt'> {
}

@Table({
  modelName: 'UserTeam',
  tableName: 'UserTeam',
  timestamps: true,
})
export class UserTeam extends Model<IUserTeam, ICUserTeam> {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => createId()
  })
  declare id: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  declare isAdmin: boolean

  //Foreign keys
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare userId: string

  @ForeignKey(() => Team)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare teamId: string

  // Relations
  // @BelongsTo(() => User)
  // declare user: User
  //
  // @BelongsTo(() => Team)
  // declare team: Team
}
