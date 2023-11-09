import {RequestHandler} from "express";
import {errorHandler} from "../../../../middleware/errorHandler";
import {matchedData} from "express-validator";
import {ICTable, Table} from "../../../../sequelize-models/erd-api/Table.model";
import httpStatus from "http-status";

export const upsertTable: RequestHandler = async (req, res) => {
  try {
    const {data, ...tableData} = matchedData(req)

    tableData['name'] = data.name
    tableData['color'] = data.color

    const [, created] = await Table.upsert(tableData as ICTable)

    if (created) {
      return res.sendStatus(httpStatus.CREATED)
    } else {
      res.sendStatus(httpStatus.OK)
    }

  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
