import {Optional} from "sequelize";
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table as SequelizeTable
} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {Erd, IErd} from "./Erd.model";
import {IColumn, Column as ColumnModel} from "./Column.model";
import {Relation} from "./Relation.model";

export interface ITable {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  color: string;

  // Foreign key
  erdId: string;

  // Relations
  erd?: IErd
  columns?: IColumn[]
}

export interface ICTable extends Optional<ITable, 'id' | 'createdAt' | 'updatedAt'> {
}

@SequelizeTable({
  modelName: 'Table',
  tableName: 'Table',
  timestamps: true,
})
export class Table extends Model<ITable, ICTable> {
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

  // ForeignKey
  @ForeignKey(() => Erd)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare erdId: string

  // Relations
  @BelongsTo(() => Erd)
  declare erd: Erd

  @HasMany(() => ColumnModel, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare columns: ColumnModel[]

  @HasMany(() => Relation, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare relations: Relation[]
}
