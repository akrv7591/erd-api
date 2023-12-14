import {RequestHandler} from "express";
import {errorHandler} from "../../../../middleware/errorHandler";
import {Table} from "../../../../sequelize-models/erd-api/Table.model";
import {Column} from "../../../../sequelize-models/erd-api/Column.model";
import {erdSequelize} from "../../../../sequelize-models/erd-api";

export const tableList: RequestHandler = async (req, res) => {
  try {
    const data = await Table.findAndCountAll({
      where: {
        erdId: req.params['erdId']
      },
      include: [Column],
      order: [
        [erdSequelize.col('order'), 'ASC']
      ]
    })

    res.json(data)

  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
