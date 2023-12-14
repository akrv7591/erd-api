import {Optional} from "sequelize";
import {BelongsToMany, Column, DataType, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IUser, User} from "./User.model";
import {UserErd} from "./UserErd.model";
import {ITable, Table as TableModel} from "./Table.model";
import {IRelation, Relation} from "./Relation.model";
import {ITeam, Team} from "./Team.model";
import {TeamErd} from "./TeamErd.model";

export interface IErd {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  description: string | null;
  isPublic: boolean;

  //Relations
  users?: IUser[]
  teams?: ITeam[]
  tables?: ITable[]
  relations?: IRelation[]
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

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  declare isPublic: boolean

  // Relations
  @BelongsToMany(() => User, () => UserErd)
  declare users: User[]

  @BelongsToMany(() => Team, () => TeamErd)
  declare teams: Team[]

  @HasMany(() => TableModel, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare tables: TableModel[]

  @HasMany(() => Relation, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare relations: Relation[]

  @HasMany(() => UserErd, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare userErds: UserErd[]
}
