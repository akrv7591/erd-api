import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {EntityModel, IEntityModel,} from "./Entity.model";
import {IRelationModel, RelationModel} from "./Relation.model";
import {ITeamModel, TeamModel} from "./Team.model";
import {IMemoModel, MemoModel} from "./Memo.mode";

export interface IErdModel {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  description: string | null;
  isPublic: boolean;
  tableNameCase: "snake" | "pascal" | "camel";
  columnNameCase: "snake" | "camel";

  teamId: string

  //Relations
  team?: ITeamModel
  entities?: IEntityModel[]
  relations?: IRelationModel[]
  memos?: IMemoModel[]
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

  @ForeignKey(() => TeamModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare teamId: string;

  // Relations
  @BelongsTo(() => TeamModel)
  declare team: TeamModel

  @HasMany(() => EntityModel, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare entities: EntityModel[]

  @HasMany(() => RelationModel, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare relations: RelationModel[]

  @HasMany(() => MemoModel, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare memos: MemoModel[]
}
