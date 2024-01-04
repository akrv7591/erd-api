import {Optional} from "sequelize";
import {Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {ITeam, Team} from "./Team.model";
import {Erd, IErd} from "./Erd.model";

export interface ITeamErd {
  createdAt: Date
  updatedAt: Date

  //Foreign keys
  teamId: string
  erdId: string

  //Relations
  team?: ITeam
  erd?: IErd
}

export interface ICTeamErd extends Optional<ITeamErd, 'createdAt' | 'updatedAt'> {
}

@Table({
  modelName: 'TeamErd',
  tableName: 'TeamErd',
  timestamps: true,
})
export class TeamErd extends Model<ITeamErd, ICTeamErd> {
  @PrimaryKey
  @ForeignKey(() => Team)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare teamId: string

  @PrimaryKey
  @ForeignKey(() => Erd)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare erdId: string

}
