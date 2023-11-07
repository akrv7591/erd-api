import {Optional} from "sequelize";
import {BelongsToMany, Column, DataType, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUser, User} from "./User.model";
import {UserErd} from "./UserErd.model";
import {ICTable, Table as TableModel} from "./Table.model";

export interface IErd {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  description: string | null;

  //Relations
  users?: IUser[]
  tables?: ICTable[]
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

  // Relations
  @BelongsToMany(() => User, () => UserErd)
  declare users: User[]

  @HasMany(() => TableModel, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare tables: TableModel[]
}
