import {Optional} from "sequelize";
import {Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {IUser, User} from "./User.model";
import {ITeam, Team} from "./Team.model";

export interface IUserTeam {
  //Composite primary keys
  userId: string
  teamId: string

  createdAt: Date
  updatedAt: Date
  isAdmin: boolean

  //Relations
  user?: IUser
  team?: ITeam
}

export interface ICUserTeam extends Optional<IUserTeam, 'createdAt' | 'updatedAt'> {
}

@Table({
  modelName: 'UserTeam',
  tableName: 'UserTeam',
  timestamps: true,
})
export class UserTeam extends Model<IUserTeam, ICUserTeam> {
  //Composite primary keys
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare userId: string

  @PrimaryKey
  @ForeignKey(() => Team)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare teamId: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  declare isAdmin: boolean



  // Relations
  // @BelongsTo(() => User)
  // declare user-router: User
  //
  // @BelongsTo(() => Team)
  // declare team-router: Team
}
