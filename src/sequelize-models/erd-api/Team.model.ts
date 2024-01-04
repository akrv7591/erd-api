import {Optional} from "sequelize";
import {BelongsToMany, Column, DataType, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUser, User} from "./User.model";
import {UserTeam} from "./UserTeam.model";
import {Erd, IErd} from "./Erd.model";

export interface ITeam {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string

  //Relations
  users?: IUser[]
  erds?: IErd[]
}

export interface ICTeam extends Optional<ITeam, 'id' | 'createdAt' | 'updatedAt'> {
}

@Table({
  modelName: 'Team',
  tableName: 'Team',
  timestamps: true,
})
export class Team extends Model<ITeam, ICTeam> {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
    defaultValue: () => createId()
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare name: string

  // Relations
  @BelongsToMany(() => User, () => UserTeam)
  declare users: User[]

  @HasMany(() => Erd)
  declare erds: Erd[]

  @HasMany(() => UserTeam)
  declare userTeams: UserTeam[]
}
