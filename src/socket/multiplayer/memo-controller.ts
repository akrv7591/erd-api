import {CallbackDataStatus, Key, MemoEnum} from "../../enums/multiplayer";
import {Server, Socket} from "socket.io";
import {RedisClientType} from "redis";
import {ICMemo, IMemo, Memo} from "../../sequelize-models/erd-api/Memo.mode";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../sequelize-models/erd-api";

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
  const playgroundKey = `${Key.playground}:${playgroundId}`

  const onAdd = async (data: ICMemo, callback: Function) => {
    const callbackData = getCallbackData(MemoEnum.add)
    let transaction: Transaction | null = null

    try {
      transaction = await erdSequelize.transaction()
      const memo = await Memo.create(data, {transaction})
      await redis.json.arrAppend(playgroundKey, '.memos', memo.toJSON() as any)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = data
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
    let transaction: Transaction | null = null

    try {
      transaction = await erdSequelize.transaction()
      await Memo.upsert(data, {transaction})
      await redis.json.set(playgroundKey, `.memos[?(@.id=='${data.id}')]`, data as any)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data = data

      await transaction.commit()
      socket.to(playgroundKey).emit(MemoEnum.put, data)
      callback(callbackData)


    } catch (e) {
      console.error("MEMO PUT ERROR", e)
      await transaction?.rollback()
      callback(callbackData)
    }
  }


  const onPatch = async ({memoId, key, value}: { memoId: string, key: string, value: any }, callback: Function) => {
    const callbackData = getCallbackData(MemoEnum.patch)
    let transaction: Transaction | null = null

    try {
      transaction = await erdSequelize.transaction()
      await Memo.update({[key]: value}, {
        where: {
          id: memoId
        },
        transaction
      })
      await redis.json.set(playgroundKey, `.memos[?(@.id=='${memoId}')].${key}`, value)

      callbackData.status = CallbackDataStatus.OK
      callbackData.data[key] = value
      await transaction.commit()
      socket.to(playgroundKey).emit(MemoEnum.patch, {memoId, key, value})
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
