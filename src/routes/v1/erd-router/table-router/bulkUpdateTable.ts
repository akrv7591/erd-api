import {RequestHandler} from "express";
import {errorHandler} from "../../../../middleware/errorHandler";
import {matchedData} from "express-validator";
import {Table} from "../../../../sequelize-models/erd-api/Table.model";
import httpStatus from "http-status";

export const bulkUpdateTable: RequestHandler = async (req, res) => {
  try {
    const {tableList} = matchedData(req) as any

    await Table.bulkCreate(tableList.map(({data, ...table}: any) => ({
      ...table,
      name: data.name,
      color: data.color
    })), {
      updateOnDuplicate: ['id', 'name', 'position', 'color']
    })


    res.sendStatus(httpStatus.OK)


  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
