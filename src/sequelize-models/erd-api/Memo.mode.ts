import {ErdModel, IErdModel} from "./Erd.model";
import {IUserModel, UserModel} from "./User.model";
import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {INodePosition} from "./Entity.model";
import {NODE_TYPES} from "../../enums/node-type";

export interface IMemoModel {
  id: string;
  content: string;
  color: string;
  position: INodePosition;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;

  // Foreign Key
  erdId: string;
  userId: string | null;

  // Relations
  erd?: IErdModel;
  user?: IUserModel;
}

export interface ICMemoModel extends Optional<IMemoModel, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({
  modelName: "MemoModel",
  tableName: "Memo",
})
export class MemoModel extends Model<IMemoModel, ICMemoModel> {
  @PrimaryKey
  @Column({
    allowNull: false,
    unique: true,
    defaultValue: () => createId(),
  })
  declare id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare content: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  declare color: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare position: string

  // @Column({
  //   type: DataType.INTEGER,
  //   allowNull: false,
  //   defaultValue: () => 200,
  // })
  // declare height: number;
  //
  // @Column({
  //   type: DataType.INTEGER,
  //   allowNull: false,
  //   defaultValue: () => 200,
  // })
  // declare width: number;

  @ForeignKey(() => ErdModel)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare erdId: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.STRING
  })
  declare userId: string;

  @BelongsTo(() => ErdModel)
  declare erd: IErdModel;

  @BelongsTo(() => UserModel)
  declare user: IUserModel;

  @Column(DataType.VIRTUAL)
  get data() {
    return {
      content: this.getDataValue('content'),
      color: this.getDataValue('color'),
    }
  }

  @Column(DataType.VIRTUAL)
  get type() {
    return NODE_TYPES.MEMO
  }
}
