import {RequestHandler} from "express";
import {errorHandler} from "../../../../../middleware/errorHandler";
import {Relation} from "../../../../../sequelize-models/erd-api/Relation.model";

export const relationList: RequestHandler = async (req, res) => {
  try {
    const data = Relation.findAndCountAll({
      where: {
        tableId: req.params['tableId']
      }
    })

    res.json(data)
  } catch (e: any){
    errorHandler(e, req, res)
  }
}
