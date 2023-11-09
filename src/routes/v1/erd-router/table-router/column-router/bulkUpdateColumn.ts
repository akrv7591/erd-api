import {RequestHandler} from "express";
import {errorHandler} from "../../../../../middleware/errorHandler";
import {matchedData} from "express-validator";
import {Column, ICColumn} from "../../../../../sequelize-models/erd-api/Column.model";
import httpStatus from "http-status";

export const bulkUpdateColumn: RequestHandler = async (req, res) => {
  try {
    const columnList = matchedData(req) as Omit<ICColumn, 'tableId'>[]
    const tableId = req.params['tableId']
    if (!tableId) return res.status(httpStatus.BAD_REQUEST)

    await Column.bulkCreate(columnList.map(column => ({...column, tableId})), {
      updateOnDuplicate: [
        "id",
        "name",
        "primary",
        "type",
        "foreignKey",
        "null",
        "unique",
        "unsigned",
        "autoIncrement",
        "comment",
        "tableId",
      ]
    })

    res.sendStatus(httpStatus.OK)

  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
