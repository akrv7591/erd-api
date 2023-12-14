import {Optional} from "sequelize";
import {
  BelongsTo,
  Column as SequelizeColumn,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table as SequelizeTable
} from "sequelize-typescript";
import {Erd, IErd} from "./Erd.model";

export interface IRelation {
  id: string;
  source: string;
  target: string;
  createdAt: string;
  markerEnd: string;

  // Foreign key
  erdId: string;

  // Relations
  erd?: IErd
}

export interface ICRelation extends Optional<IRelation, 'createdAt'> {
}

@SequelizeTable({
  modelName: 'Relation',
  tableName: 'Relation',
  timestamps: true,
  updatedAt: false
})
export class Relation extends Model<IRelation, ICRelation> {
  @PrimaryKey
  @SequelizeColumn({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare id: string;

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

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare markerEnd: string

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
}
