import {RequestHandler} from "express";
import {errorHandler} from "../../../../middleware/errorHandler";
import {Table} from "../../../../sequelize-models/erd-api/Table.model";

export const tableCount: RequestHandler = async (req, res) => {
  try {
    const count = await Table.count({
      where: {
        erdId: req.params['erdId']
      }
    })


    res.json({count})

  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
