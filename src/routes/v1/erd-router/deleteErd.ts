import {RequestHandler} from "express";
import {errorHandler} from "../../../middleware/errorHandler";
import {isCuid} from "@paralleldrive/cuid2";
import httpStatus from "http-status";
import {Erd} from "../../../sequelize-models/erd-api/Erd.model";

export const deleteErd: RequestHandler = async (req, res) => {
  try {
    const erdId = req.params['erdId']

    if (!erdId || !isCuid(erdId)) return res.status(httpStatus.BAD_REQUEST)

    const deleted = await Erd.destroy({
      where: {
        id: erdId
      }
    })

    if (!deleted) return res.sendStatus(httpStatus.NOT_FOUND)

    return res.sendStatus(httpStatus.OK)
  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
