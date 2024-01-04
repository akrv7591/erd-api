import {RequestHandler} from "express";
import {errorHandler} from "../../../middleware/errorHandler";
import {matchedData} from "express-validator";
import {Erd} from "../../../sequelize-models/erd-api/Erd.model";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../../sequelize-models/erd-api";
import httpStatus from "http-status";


export const put: RequestHandler = async (req, res) => {
  let transaction: Transaction | null = null
  try {
    transaction = await erdSequelize.transaction()
    const {users, ...data} = matchedData(req) as any
    const [erd, created] = await Erd.upsert(data, {
      transaction
    })

    await transaction.commit()

    res.status(created ? httpStatus.CREATED : httpStatus.OK).json(erd)

  } catch (e: any) {
    await transaction?.rollback()
    console.error(e)
    errorHandler(e, req, res)
  }
}
