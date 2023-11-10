import {RequestHandler} from "express";
import {errorHandler} from "../../../../middleware/errorHandler";
import {isCuid} from "@paralleldrive/cuid2";
import httpStatus from "http-status";
import {Table} from "../../../../sequelize-models/erd-api/Table.model";

export const deleteTable: RequestHandler = async (req, res) => {
  try {
    const tableId = req.params['tableId']

    if (!tableId || !isCuid(tableId)) return res.sendStatus(httpStatus.BAD_REQUEST)

    const deleted = await Table.destroy({
      where: {
        id: tableId
      }
    })

    res.sendStatus(deleted? httpStatus.OK: httpStatus.NOT_FOUND)

  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
