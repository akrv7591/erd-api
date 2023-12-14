import {RequestHandler} from "express";
import {errorHandler} from "../../../../middleware/errorHandler";
import {matchedData} from "express-validator";
import {Relation} from "../../../../sequelize-models/erd-api/Relation.model";
import httpStatus from "http-status";

export const deleteRelation: RequestHandler = async (req, res) => {
  try {
    const {erdId, relationId} = matchedData(req)

    const deleted = await Relation.destroy({
      where: {
        erdId,
        id: relationId
      }
    })

    res.sendStatus(deleted? httpStatus.OK: httpStatus.NO_CONTENT)
  } catch (e: any) {
    errorHandler(e, req, res)
  }
}
