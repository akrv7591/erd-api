import {internalErrorHandler} from "../../../utils/errorHandler";
import {ErdModel, ICErdModel} from "../../../sequelize-models/erd-api/Erd.model";
import httpStatus from "http-status";
import {PutRequest} from "../../../types/types";

export type ErdUpsertParams = {}
export type ErdUpsertBody = ICErdModel

export const erdUpsert: PutRequest<ErdUpsertParams, ErdUpsertBody> = async (req, res) => {
  try {
    const data = req.body
    const [erd, created] = await ErdModel.upsert(data)

    res.status(created ? httpStatus.CREATED : httpStatus.OK).json(erd)

  } catch (e: any) {
    console.error(e)
    internalErrorHandler(res, e)
  }
}
