import {Optional} from "sequelize";
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table as SequelizeTable
} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {ITable, Table} from "./Table.model";

export interface IRelation {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  source: string;
  target: string;

  // Foreign key
  tableId: string;

  // Relations
  table?: ITable
}

export interface ICRelation extends Optional<IRelation, 'id' | 'createdAt' | 'updatedAt'> {
}

@SequelizeTable({
  modelName: 'Relation',
  tableName: 'Relation',
  timestamps: true,
})
export class Relation extends Model<IRelation, ICRelation> {
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
  declare type: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare source: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare target: string

  // ForeignKey
  @ForeignKey(() => Table)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare tableId: string

  // Relations
  @BelongsTo(() => Table)
  declare table: Table
}
