import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import httpStatus from "http-status";
import {ErdModel} from "../../../sequelize-models/erd-api/Erd.model";
import {DeleteRequest} from "../../../types/types";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../../constants/common";

export type ErdDeleteParams = {
  erdId: string
}

export type ErdDeleteBody = {}

export const erdDelete: DeleteRequest<ErdDeleteParams, ErdDeleteBody> = async (req, res) => {
  try {
    const {erdId} = req.params

    const deleted = await ErdModel.destroy({
      where: {
        id: erdId
      }
    })

    if (!deleted) {
      return errorHandler(res, HttpStatusCode.NotFound, COMMON.API_ERRORS.NOT_FOUND)
    }

    return res.sendStatus(httpStatus.OK)
  } catch (e: any) {
    internalErrorHandler(res, e)
  }
}
