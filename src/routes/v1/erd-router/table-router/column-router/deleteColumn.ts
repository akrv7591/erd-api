import {RequestHandler} from "express";
import {errorHandler} from "../../../../../middleware/errorHandler";
import {Column} from "../../../../../sequelize-models/erd-api/Column.model";
import httpStatus from "http-status";
import {isCuid} from "@paralleldrive/cuid2";

export const deleteColumn: RequestHandler = async (req, res) => {
  try {
    const columnId = req.params['columnId']

    if (!columnId || !isCuid(columnId)) return res.sendStatus(httpStatus.BAD_REQUEST)

    const deleted = await Column.destroy({
      where: {
        id: columnId
      }
    })

    if (!deleted) return res.sendStatus(httpStatus.NOT_FOUND)

    res.sendStatus(httpStatus.OK)
  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
