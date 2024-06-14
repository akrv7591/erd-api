import {
  BelongsTo,
  Column as SequelizeColumn,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table as SequelizeTable
} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {EntityModel, IEntityModel} from "./Entity.model";
import {Optional} from "sequelize";

export interface IColumnModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  primary: boolean;
  type: string;
  foreignKey: boolean;
  notNull: boolean;
  unique: boolean;
  unsigned: boolean;
  autoIncrement: boolean;
  comment: string;
  order: number;

  // Foreign key
  entityId: string;

  // Relations
  entity?: IEntityModel
}

export interface ICColumnModel extends Optional<IColumnModel, 'id' | 'createdAt' | 'updatedAt'> {
}

@SequelizeTable({
  modelName: 'ColumnModel',
  tableName: 'Column',
  timestamps: true,
  defaultScope: {
    order: [['order', 'asc']]
  }
})
export class ColumnModel extends Model<IColumnModel, ICColumnModel> {
  @PrimaryKey
  @SequelizeColumn({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
    defaultValue: () => createId()
  })
  declare id: string;

  @SequelizeColumn({
    type: DataType.STRING,
    allowNull: false
  })
  declare name: string

  @SequelizeColumn({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  declare primary: boolean;

  @SequelizeColumn({
    type: DataType.STRING,
    defaultValue: false
  })
  declare type: string;

  @SequelizeColumn({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  declare foreignKey: boolean;

  @SequelizeColumn({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  declare notNull: boolean;

  @SequelizeColumn({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  declare unique: boolean;

  @SequelizeColumn({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  declare unsigned: boolean;

  @SequelizeColumn({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  declare autoIncrement: boolean;

  @SequelizeColumn({
    type: DataType.STRING,
    defaultValue: false
  })
  declare comment: string;

  @SequelizeColumn({
    type: DataType.SMALLINT,
    defaultValue: false
  })
  declare order: number;

  // ForeignKey
  @ForeignKey(() => EntityModel)
  @SequelizeColumn({
    type: DataType.STRING,
    allowNull: false
  })
  declare entityId: string

  // Virtual
  @SequelizeColumn(DataType.VIRTUAL)
  get selected() {
    return false
  }

  // Relations
  @BelongsTo(() => EntityModel)
  declare entity: EntityModel
}
