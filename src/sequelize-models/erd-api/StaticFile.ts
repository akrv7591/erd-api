import {Optional} from "sequelize";
import {Column, DataType, HasOne, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IProfile, Profile} from "./Profile";
import config from "../../config/config";

export interface IStaticFile {
  id: string;
  key: string;
  mime: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  profile?: IProfile
}

export interface ICStaticFile extends Optional<IStaticFile, 'id' | 'createdAt' | 'updatedAt'> {}


@Table({
  modelName: "StaticFile",
  tableName: "StaticFile",
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

  @HasOne(() => Profile, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare profile: IProfile;

  // Virtual fields
  @Column(DataType.VIRTUAL)
  get url() {
    return config.s3.base_url + "/" + config.s3.bucket + "/" + this.key
  }
}
