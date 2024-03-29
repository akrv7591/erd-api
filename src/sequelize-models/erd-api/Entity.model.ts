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
import {ErdModel, IErdModel} from "./Erd.model";
import {ColumnModel as ColumnModel, IColumnModel} from "./Column.model";
import {NODE_TYPES} from "../../enums/node-type";

export interface INodePosition {
  x: number,
  string: number
}


export interface IEntityModel {
  id: string;
  createdAt: string;
  updatedAt: string;

  name: string;
  color: string;
  position: INodePosition;
  type: string;

  // Foreign key
  erdId: string;

  // Relations
  erd?: IErdModel
  columns?: IColumnModel[]
}

export interface ICEntityModel extends Optional<IEntityModel, 'id' | 'createdAt' | 'updatedAt'> {
}

@SequelizeTable({
  modelName: 'EntityModel',
  tableName: 'Entity',
  timestamps: true,
})
export class EntityModel extends Model<IEntityModel, ICEntityModel> {
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
  })
  declare color: string | null

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare position: string

  // ForeignKey
  @ForeignKey(() => ErdModel)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare erdId: string

  // Relations
  @BelongsTo(() => ErdModel)
  declare erd: ErdModel

  @HasMany(() => ColumnModel, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  declare columns: ColumnModel[]

  @Column(DataType.VIRTUAL)
  get data() {
    return {
      name: this.getDataValue('name'),
      color: this.getDataValue('color'),
      columns: this.getDataValue('columns' as any),
    }
  }

  @Column(DataType.VIRTUAL)
  get type() {
    return NODE_TYPES.ENTITY
  }
}
