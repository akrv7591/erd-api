import {CallbackDataStatus, Key, MemoEnum} from "../../enums/multiplayer";
import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {IMemo, Memo} from "../../sequelize-models/erd-api/Memo.mode";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../sequelize-models/erd-api";
import {INodePosition} from "../../sequelize-models/erd-api/Entity.model";

export interface CallbackDataType {
  type: MemoEnum;
  status: CallbackDataStatus
  data: any
}

// Helper functions

function getCallbackData(type: MemoEnum): CallbackDataType {
  return {
    type,
    status: CallbackDataStatus.FAILED,
    data: null
  }
}


export const memoController = (io: Server, socket: Socket, redis: RedisClientType) => {
  const playgroundId = socket.handshake.auth['playgroundId']
  const playerId = socket.handshake.auth['playerId']
  const playgroundKey = `${Key.playground}:${playgroundId}`

  const onAdd = async (m: {position: INodePosition, data: Pick<IMemo, 'color' | 'content'>}, callback: Function) => {
    const callbackData = getCallbackData(MemoEnum.add)
    let transaction: Transaction | null = null

    try {
      transaction = await erdSequelize.transaction()
      const memo = await Memo.create({
        position: m.position,
        ...m.data,
        erdId: playgroundId,
        userId: playerId
        }, {transaction})
      await memo.reload({transaction})
      await redis.json.arrAppend(playgroundKey, '.memos', memo.toJSON() as any)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = {
        ...memo.toJSON(),
      }
      await transaction.commit()
      socket.to(playgroundKey).emit(MemoEnum.add, memo.toJSON())
      callback(callbackData)
    } catch (e) {
      console.error("MEMO ADD ERROR",e)
      await transaction?.rollback()
      callback(callbackData)
    }
  }

  const onPut = async (data: IMemo, callback: Function) => {
    const callbackData = getCallbackData(MemoEnum.put)
    try {
      const memoRedisData: any[] = []
      for (const [key, value] of Object.entries(data)) {
        if (key === 'id') continue
        memoRedisData.push({ key: playgroundKey, path: `.memos[?(@.id=='${data.id}')].${key}`, value });
      }

      await Promise.all([
        redis.json.mSet(memoRedisData),
        Memo.update(data, {where: {id: data.id}})
      ])

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = data

      socket.to(playgroundKey).emit(MemoEnum.put, data)
      callback(callbackData)


    } catch (e) {
      console.error("MEMO PUT ERROR", e)
      callback(callbackData)
    }
  }


  const onPatch = async (data: { memoId: string, key: string, value: any }, callback: Function) => {
    const callbackData = getCallbackData(MemoEnum.patch)
    let transaction: Transaction | null = null
    try {
      transaction = await erdSequelize.transaction()
      await Memo.update({[data.key]: data.value}, {
        where: {
          id: data.memoId
        },
        transaction
      })
      await redis.json.set(playgroundKey, `.memos[?(@.id=='${data.memoId}')].data.${data.key}`, data.value)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = data
      await transaction.commit()
      socket.to(playgroundKey).emit(MemoEnum.patch, data)
      callback(callbackData)

    } catch (e) {
      console.error(e)
      await transaction?.rollback()
      callback(callbackData)
    }
  }

  const onDelete = async (memoId: string, callback: Function) => {
    const callbackData = getCallbackData(MemoEnum.patch)
    let transaction: Transaction | null = null

    try {
      transaction = await erdSequelize.transaction()
      await Memo.destroy({
        where: {
          id: memoId
        },
        transaction
      })

      await redis.json.del(playgroundKey, `.memos[?(@.id=='${memoId}')]`)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = { memoId }
      await transaction.commit()
      socket.to(playgroundKey).emit(MemoEnum.delete, memoId)
      callback(callbackData)

    } catch (e) {
      console.error(e)
      await transaction?.rollback()
      callback(callbackData)
    }
  }

  return {
    onAdd,
    onPatch,
    onPut,
    onDelete
  }
}
