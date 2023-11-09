import {RequestHandler} from "express";
import {errorHandler} from "../../../../../middleware/errorHandler";
import {Column} from "../../../../../sequelize-models/erd-api/Column.model";

export const columnList: RequestHandler = async (req, res) => {
  try {
    const data = Column.findAndCountAll({
      where: {
        tableId: req.params['tableId']
      }
    })

    res.json(data)
  } catch (e: any){
    errorHandler(e, req, res)
  }
}
