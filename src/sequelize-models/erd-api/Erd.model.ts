import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {ITeamModel, TeamModel} from "./Team.model";

export interface IErdModel {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  description: string | null;
  isPublic: boolean;
  tableNameCase: "snake" | "pascal" | "camel";
  columnNameCase: "snake" | "camel";
  data: Object
  entityCount: number

  // Foreign key
  teamId: string

  //Relations
  team?: ITeamModel
}

export interface ICErdModel extends Optional<IErdModel, 'id' | 'createdAt' | 'description'> {
}

@Table({
  modelName: 'ErdModel',
  tableName: 'Erd',
  timestamps: true,
})
export class ErdModel extends Model<IErdModel, ICErdModel> {
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

  @Column({
    type: DataType.ENUM("snake", "pascal", "camel"),
    defaultValue: "pascal",
    allowNull: false,
  })
  declare tableNameCase: "snake" | "pascal" | "camel";

  @Column({
    type: DataType.ENUM("snake", "camel"),
    defaultValue: "camel",
    allowNull: false,
  })
  declare columnNameCase: "snake" | "camel";

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare data: Object

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    defaultValue: () => 0,
    allowNull: false
  })
  declare entityCount: number

  // Foreign keys
  @ForeignKey(() => TeamModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare teamId: string;

  // Relations
  @BelongsTo(() => TeamModel)
  declare team: TeamModel

  toYDocData() {
    const erd = this.toJSON()
    return {
      erd: {
        id: erd.id,
        name: erd.name,
        description: erd.description,
        isPublic: erd.isPublic,
        tableNameCase: erd.tableNameCase,
        columnNameCase: erd.columnNameCase,
      },
      ...erd.data
      // nodes: [],
      // relations: []
    }
  }
}
