import {Optional} from "sequelize";
import {BelongsToMany, Column, DataType, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUser, User} from "./User.model";
import {UserTeam} from "./UserTeam.model";
import {Erd, IErd} from "./Erd.model";
import {TeamErd} from "./TeamErd.model";

export interface ITeam {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string

  //Relations
  users?: IUser[]
  erds?: IErd[]
}

export interface ICTeam extends Optional<ITeam, 'id' | 'createdAt'> {
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

  @BelongsToMany(() => Erd, () => TeamErd)
  declare erds: Erd[]
}
