import {RequestHandler} from "express";
import {errorHandler} from "../../../../../middleware/errorHandler";
import {matchedData} from "express-validator";
import {Column, ICColumn} from "../../../../../sequelize-models/erd-api/Column.model";
import httpStatus from "http-status";

export const upsertColumn: RequestHandler = async (req, res) => {
  try {

    // const tableId = req.params['tableId']
    // if (!tableId) return res.status(httpStatus.BAD_REQUEST)


    const columnData = matchedData(req) as ICColumn
    // columnData['tableId'] = tableId

    const [, created] = await Column.upsert(columnData)

    if (created) return res.sendStatus(httpStatus.CREATED)

    res.sendStatus(httpStatus.OK)

  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
