import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {ITable, Table as TableModel} from "./Table.model";
import {IRelation, Relation} from "./Relation.model";
import {ITeam, Team} from "./Team.model";

export interface IErd {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  description: string | null;
  isPublic: boolean;

  teamId: string

  //Relations
  team?: ITeam
  tables?: ITable[]
  relations?: IRelation[]
}

export interface ICErd extends Optional<IErd, 'id' | 'createdAt' | 'description'> {
}

@Table({
  modelName: 'Erd',
  tableName: 'Erd',
  timestamps: true,
})
export class Erd extends Model<IErd, ICErd> {
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

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare description: string | null

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  declare isPublic: boolean

  @ForeignKey(() => Team)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare teamId: string;

  // Relations

  @BelongsTo(() => Team)
  declare team: Team

  @HasMany(() => TableModel, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare tables: TableModel[]

  @HasMany(() => Relation, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare relations: Relation[]

}
