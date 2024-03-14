import {Erd, IErd} from "./Erd.model";
import {IUser, User} from "./User.model";
import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";

export interface IMemo {
  id: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;

  // Foreign Key
  erdId: string;
  userId: string;

  // Relations
  erd?: IErd;
  user?: IUser;
}

export interface ICMemo extends Optional<IMemo, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({
  modelName: "Memo",
  tableName: "Memo",
})
export class Memo extends Model<IMemo, ICMemo> {
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

  @ForeignKey(() => Erd)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare erdId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING
  })
  declare userId: string;

  @BelongsTo(() => Erd)
  declare erd: IErd;

  @BelongsTo(() => User)
  declare user: IUser;
}
