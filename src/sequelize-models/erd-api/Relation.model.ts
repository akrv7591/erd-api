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
import {ErdModel, IErdModel} from "./Erd.model";

export interface IRelationModel {
  id: string;
  source: string;
  target: string;
  createdAt: string;
  markerEnd: string;

  // Foreign key
  erdId: string;

  // Relations
  erd?: IErdModel
}

export interface ICRelationModel extends Optional<IRelationModel, 'createdAt'> {
}

@SequelizeTable({
  modelName: 'RelationModel',
  tableName: 'Relation',
  timestamps: true,
  updatedAt: false
})
export class RelationModel extends Model<IRelationModel, ICRelationModel> {
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
  @ForeignKey(() => ErdModel)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare erdId: string

  // Relations
  @BelongsTo(() => ErdModel)
  declare erd: ErdModel
}
