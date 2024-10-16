import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IStaticFile, StaticFile} from "./StaticFile";

export interface IErd {
  id: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  name: string
  description: string | null;
  isPublic: boolean;
  tableNameCase: "snake" | "pascal" | "camel";
  columnNameCase: "snake" | "camel";
  data: Object
  entityCount: number
  teamId: string
  userId: string

  // Foreign Keys
  thumbnailId: string | null

  // Relations
  thumbnail?: IStaticFile
}

export interface ICErd extends Optional<IErd, 'id' | 'createdAt' | 'description'> {}

@Table({
  modelName: 'Erd',
  tableName: 'Erd',
  timestamps: true,
  paranoid: true
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

  @Column({
    type: DataType.ENUM("snake", "pascal", "camel"),
    defaultValue: "pascal",
    allowNull: false,
  })
  declare tableNameCase: "snake" | "pascal" | "camel";

  @Column({
    type: DataType.ENUM("snake", "camel"),
    defaultValue: "camel",
    allowNull: false,
  })
  declare columnNameCase: "snake" | "camel";

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: () => ({nodes: {}, edges: {}}),
  })
  declare data: Object

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    defaultValue: () => 0,
    allowNull: false
  })
  declare entityCount: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare teamId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare userId: string;

  // Foreign keys
  @ForeignKey(() => StaticFile)
  @Column({
    type: DataType.STRING,
  })
  declare thumbnailId: string | null

  // Relations
  @BelongsTo(() => StaticFile)
  declare thumbnail: StaticFile

  // Custom Methods

  toYDocData() {
    const erd = this.toJSON()
    return {
      erd: {
        id: erd.id,
        name: erd.name,
        description: erd.description,
        isPublic: erd.isPublic,
        tableNameCase: erd.tableNameCase,
        columnNameCase: erd.columnNameCase,
      },
      ...erd.data as {
        nodes: Record<string, any>
        edges: Record<string, any>
        entityConfigs: Record<string, any>
      }
    }
  }
}
