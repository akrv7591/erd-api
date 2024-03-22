import {IUser, User} from "./User.model";
import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {IStaticFile, StaticFile} from "./StaticFile";

export interface IProfile {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Foreign key
  imageId: string | null;
  userId: string;

  user?: IUser;
  image?: IStaticFile | null
}

export interface ICProfile extends Optional<IProfile, 'id' | 'createdAt'| 'updatedAt'> {}


@Table({
  modelName: "Profile",
  tableName: "Profile",
})
export class Profile extends Model<IProfile, ICProfile> {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => createId()
  })
  declare id: string;


  // Foreign keys
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare userId: string

  @ForeignKey(() => StaticFile)
  @Column({
    type: DataType.STRING,
  })
  declare imageId: string

  // Relations
  @BelongsTo(() => User)
  declare user: User

  @BelongsTo(() => StaticFile)
  declare image: StaticFile | null
}
