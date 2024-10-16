import {Optional} from "sequelize";
import {Column, DataType, HasOne, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import config from "../../config/config";
import {Erd, IErd} from "./Erd";

export interface IStaticFile {
  id: string;
  key: string;
  mime: string;
  name: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Relations
  erd?: IErd[]
}

export interface ICStaticFile extends Optional<IStaticFile, 'id' | 'createdAt' | 'updatedAt' | 'url'> {}
@Table({
  modelName: "StaticFile",
  tableName: "StaticFile",
  paranoid: true,
  deletedAt: true
})
export class StaticFile extends Model<IStaticFile, ICStaticFile> {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => createId()
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare key: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare mime: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @HasOne(() => Erd, {
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  })
  declare erd: Erd;

  // Virtual fields
  @Column(DataType.VIRTUAL)
  get url() {
    return config.s3.base_url + "/" + config.s3.bucket + "/" + this.key
  }
}
