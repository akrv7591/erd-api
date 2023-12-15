import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {IUser, User} from "./User.model";
import {Erd, IErd} from "./Erd.model";
import {sendUserInvitationEmail} from "../../utils/email/sendUserInvitation";

export interface IUserErd {
  // id: string
  createdAt: Date
  updatedAt: Date
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  isAdmin: boolean

  //Foreign keys
  userId: string
  erdId: string

  //Relations
  user?: IUser
  erd?: IErd
}

export interface ICUserErd extends Optional<IUserErd, 'createdAt' | 'updatedAt' | 'canRead' | 'canWrite' | 'canDelete'> {
}


@Table({
  modelName: 'UserErd',
  tableName: 'UserErd',
  timestamps: true,
  hooks: {
    afterUpsert: async ([attributes, created]: [UserErd, boolean], options) => {
      if (!created) return

      if (options.transaction) {
        options.transaction.afterCommit(async () => {
          const user = await User.findByPk(attributes.userId)

          if (!user) return
          sendUserInvitationEmail(user.toJSON())
        })
      } else {
        const user = await User.findByPk(attributes.userId)
        if (user) {
          sendUserInvitationEmail(user.toJSON())
        }
      }
    }
  }
})
export class UserErd extends Model<IUserErd, ICUserErd> {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare userId: string

  @PrimaryKey
  @ForeignKey(() => Erd)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare erdId: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  declare canRead: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  declare canWrite: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  declare canDelete: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  declare isAdmin: boolean

  @BelongsTo(() => Erd)
  declare erd: Erd

  @BelongsTo(() => User)
  declare user: User

}
