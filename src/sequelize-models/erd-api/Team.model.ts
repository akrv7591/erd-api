import {Optional} from "sequelize";
import {BelongsToMany, Column, DataType, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUserModel, UserModel} from "./User.model";
import {UserTeamModel} from "./UserTeam.model";
import {ErdModel, IErdModel} from "./Erd.model";

export interface ITeamModel {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string

  //Relations
  users?: IUserModel[]
  erds?: IErdModel[]
}

export interface ICTeamModel extends Optional<ITeamModel, 'id' | 'createdAt' | 'updatedAt'> {
}

@Table({
  modelName: 'TeamModel',
  tableName: 'Team',
  timestamps: true,
})
export class TeamModel extends Model<ITeamModel, ICTeamModel> {
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
  @BelongsToMany(() => UserModel, () => UserTeamModel)
  declare users: UserModel[]

  @HasMany(() => ErdModel)
  declare erds: ErdModel[]

  @HasMany(() => UserTeamModel)
  declare userTeams: UserTeamModel[]
}
