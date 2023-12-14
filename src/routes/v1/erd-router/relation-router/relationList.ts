import {RequestHandler} from "express";
import {errorHandler} from "../../../../middleware/errorHandler";
import {Relation} from "../../../../sequelize-models/erd-api/Relation.model";

export const relationList: RequestHandler = async (req, res) => {
  try {
    const data = await Relation.findAndCountAll({
      where: {
        erdId: req.params['erdId']
      }
    })

    res.json(data)
  } catch (e: any){
    errorHandler(e, req, res)
  }
}
