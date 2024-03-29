import {RequestHandler} from "express";
import {internalErrorHandler} from "../../../middleware/internalErrorHandler";
import {matchedData} from "express-validator";
import {ErdModel, ICErdModel} from "../../../sequelize-models/erd-api/Erd.model";
import httpStatus from "http-status";


export const put: RequestHandler = async (req, res) => {
  try {
    const data = matchedData(req) as ICErdModel

    const [erd, created] = await ErdModel.upsert(data)

    console.log(erd.toJSON())

    res.status(created ? httpStatus.CREATED : httpStatus.OK).json(erd)

  } catch (e: any) {
    console.error(e)
    internalErrorHandler(e, req, res)
  }
}
