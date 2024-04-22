import {ErdModel, IErdModel} from "./Erd.model";
import {IUserModel, UserModel} from "./User.model";
import {Optional} from "sequelize";
import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {createId} from "@paralleldrive/cuid2";
import {INodePosition} from "./Entity.model";
import {NODE_TYPES} from "../../enums/node-type";
import redisClient from "../../redis/multiplayerRedisClient";
import {Key} from "../../enums/multiplayer";

export interface IMemoModel {
  id: string;
  content: string;
  color: string;
  position: INodePosition;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;

  // Foreign Key
  erdId: string;
  userId: string | null;

  // Relations
  erd?: IErdModel;
  user?: IUserModel;
}

export interface ICMemoModel extends Optional<IMemoModel, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({
  modelName: "MemoModel",
  tableName: "Memo",
  hooks: {
    async afterFind(data: MemoModel | MemoModel[] | null) {
      if (data === null) {
        return
      }

      if (Array.isArray(data)) {
        await Promise.all(data.map(entity => entity.getRealtimePosition()))
      }

      if (data instanceof MemoModel) {
        await data.getRealtimePosition()
      }
    },
    async afterCreate(data: MemoModel, {transaction}) {
      const nodeKey = Key.playgrounds + ":" + data.erdId + ":"+ Key.nodes + ":" + data.id + ":" + Key.position
      const savePositionToRedis = () => {
        redisClient.set(nodeKey, JSON.stringify(data.position))
      }

      if (transaction) {
        transaction.afterCommit(savePositionToRedis)
      } else {
        savePositionToRedis()
      }
    },
    async afterDestroy(data: MemoModel, {transaction}) {
      const nodeKey = Key.playgrounds + ":" + data.erdId + ":"+ Key.nodes + ":" + data.id + ":" + Key.position
      const removePositionFromRedis = async () => {
        await redisClient.del(nodeKey)
      }

      if (transaction) {
        transaction.afterCommit(removePositionFromRedis)
      } else {
        await removePositionFromRedis()
      }
    }
  }
})
export class MemoModel extends Model<IMemoModel, ICMemoModel> {
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

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare position: string

  @ForeignKey(() => ErdModel)
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare erdId: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.STRING
  })
  declare userId: string;

  @BelongsTo(() => ErdModel)
  declare erd: IErdModel;

  @BelongsTo(() => UserModel)
  declare user: IUserModel;

  @Column(DataType.VIRTUAL)
  get data() {
    return {
      content: this.getDataValue('content'),
      color: this.getDataValue('color'),
    }
  }

  @Column(DataType.VIRTUAL)
  get type() {
    return NODE_TYPES.MEMO
  }

  async getRealtimePosition() {
    const position = await redisClient.get(`${Key.playgrounds}:${this.getDataValue("erdId")}:${Key.nodes}:${this.getDataValue("id")}:${Key.position}`)
    if (position) {
      this.dataValues.position = JSON.parse(position)
    }
  }

  async saveRealtimePosition() {
    const position = await redisClient.get(`${Key.playgrounds}:${this.getDataValue("erdId")}:${Key.nodes}:${this.getDataValue("id")}:${Key.position}`)
    if (position) {
      this.dataValues.position = JSON.parse(position)
      await this.save()
    }
  }
}
