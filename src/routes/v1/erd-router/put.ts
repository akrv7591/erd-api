import {RequestHandler} from "express";
import {internalErrorHandler} from "../../../middleware/internalErrorHandler";
import {ErdModel, ICErdModel} from "../../../sequelize-models/erd-api/Erd.model";
import httpStatus from "http-status";


export const put: RequestHandler<{}, {}, ICErdModel> = async (req, res) => {
  try {
    const data = req.body
    const [erd, created] = await ErdModel.upsert(data)

    res.status(created ? httpStatus.CREATED : httpStatus.OK).json(erd)

  } catch (e: any) {
    console.error(e)
    internalErrorHandler(e, req, res)
  }
}
