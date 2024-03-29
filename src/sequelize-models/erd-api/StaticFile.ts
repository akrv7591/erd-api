import {Optional} from "sequelize";
import {Column, DataType, HasOne, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IProfileModel, ProfileModel} from "./Profile.model";
import config from "../../config/config";

export interface IStaticFileModel {
  id: string;
  key: string;
  mime: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  profile?: IProfileModel
}

export interface ICStaticFileModel extends Optional<IStaticFileModel, 'id' | 'createdAt' | 'updatedAt'> {}


@Table({
  modelName: "StaticFileModel",
  tableName: "StaticFile",
})
export class StaticFileModel extends Model<IStaticFileModel, ICStaticFileModel> {
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

  @HasOne(() => ProfileModel, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  declare profile: IProfileModel;

  // Virtual fields
  @Column(DataType.VIRTUAL)
  get url() {
    return config.s3.base_url + "/" + config.s3.bucket + "/" + this.key
  }
}
