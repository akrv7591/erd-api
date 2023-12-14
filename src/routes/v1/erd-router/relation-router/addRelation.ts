import {RequestHandler} from "express";
import {errorHandler} from "../../../../middleware/errorHandler";
import {matchedData} from "express-validator";
import {ICRelation, Relation} from "../../../../sequelize-models/erd-api/Relation.model";
import httpStatus from "http-status";

export const addRelation: RequestHandler = async (req, res) => {
  try {
    const data = matchedData(req) as ICRelation

    await Relation.create(data)

    res.sendStatus(httpStatus.CREATED)
  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
