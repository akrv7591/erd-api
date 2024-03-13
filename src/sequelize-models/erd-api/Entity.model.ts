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
import {Column as ColumnModel, IColumn} from "./Column.model";

export interface INodePosition {
  x: number,
  string: number
}


export interface IEntity {
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
  erd?: IErd
  columns?: IColumn[]
}

export interface ICEntity extends Optional<IEntity, 'id' | 'createdAt' | 'updatedAt'> {
}

@SequelizeTable({
  modelName: 'Entity',
  tableName: 'Entity',
  timestamps: true,
})
export class Entity extends Model<IEntity, ICEntity> {
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
    type: DataType.STRING,
    allowNull: false
  })
  declare type: string


  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare position: string

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
}
