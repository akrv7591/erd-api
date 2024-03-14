import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {Entity, IEntity,} from "./Entity.model";
import {IRelation, Relation} from "./Relation.model";
import {ITeam, Team} from "./Team.model";
import {Memo} from "./Memo.mode";

export interface IErd {
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
  team?: ITeam
  entities?: IEntity[]
  relations?: IRelation[]
  memos?: Memo[]
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

  @ForeignKey(() => Team)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare teamId: string;

  // Relations
  @BelongsTo(() => Team)
  declare team: Team

  @HasMany(() => Entity, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare entities: Entity[]

  @HasMany(() => Relation, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare relations: Relation[]

  @HasMany(() => Memo, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare memos: Memo[]
}
