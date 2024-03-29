import {Optional} from "sequelize";
import {Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {ITeamModel, TeamModel} from "./Team.model";
import {ErdModel, IErdModel} from "./Erd.model";

export interface ITeamErdModel {
  createdAt: Date
  updatedAt: Date

  //Foreign keys
  teamId: string
  erdId: string

  //Relations
  team?: ITeamModel
  erd?: IErdModel
}

export interface ICTeamErdModel extends Optional<ITeamErdModel, 'createdAt' | 'updatedAt'> {
}

@Table({
  modelName: 'TeamErdModel',
  tableName: 'TeamErd',
  timestamps: true,
})
export class TeamErdModel extends Model<ITeamErdModel, ICTeamErdModel> {
  @PrimaryKey
  @ForeignKey(() => TeamModel)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare teamId: string

  @PrimaryKey
  @ForeignKey(() => ErdModel)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare erdId: string

}
