import {RequestHandler} from "express";
import {errorHandler} from "../../../middleware/errorHandler";
import {matchedData} from "express-validator";
import {Erd, ICErd} from "../../../sequelize-models/erd-api/Erd.model";
import httpStatus from "http-status";


export const put: RequestHandler = async (req, res) => {
  try {
    const data = matchedData(req) as ICErd

    const [erd, created] = await Erd.upsert(data)

    console.log(erd.toJSON())

    res.status(created ? httpStatus.CREATED : httpStatus.OK).json(erd)

  } catch (e: any) {
    console.error(e)
    errorHandler(e, req, res)
  }
}
