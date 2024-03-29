import {IUserModel, UserModel} from "./User.model";
import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IStaticFileModel, StaticFileModel} from "./StaticFile";

export interface IProfileModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Foreign key
  imageId: string | null;
  userId: string;

  user?: IUserModel;
  image?: IStaticFileModel | null
}

export interface ICProfileModel extends Optional<IProfileModel, 'id' | 'createdAt'| 'updatedAt'> {}


@Table({
  modelName: "ProfileModel",
  tableName: "Profile",
})
export class ProfileModel extends Model<IProfileModel, ICProfileModel> {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => createId()
  })
  declare id: string;


  // Foreign keys
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare userId: string

  @ForeignKey(() => StaticFileModel)
  @Column({
    type: DataType.STRING,
  })
  declare imageId: string

  // Relations
  @BelongsTo(() => UserModel)
  declare user: UserModel

  @BelongsTo(() => StaticFileModel)
  declare image: StaticFileModel | null
}
