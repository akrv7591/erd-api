import {RequestHandler} from "express";
import {errorHandler} from "../../../middleware/errorHandler";
import {matchedData} from "express-validator";
import {Erd, ICErd} from "../../../sequelize-models/erd-api/Erd.model";
import httpStatus from "http-status";
import {UserErd} from "../../../sequelize-models/erd-api/UserErd.model";

export const put: RequestHandler = async (req, res) => {
  try {
    const data = matchedData(req) as ICErd
    const [erd, created] = await Erd.upsert(data)

    if (created) {
      await UserErd.create({
        erdId: erd.id,
        userId: req.authorizationUser?.id!,
        isAdmin: true,
        canEdit: true
      })

      return res.status(httpStatus.CREATED).json(erd)
    }

    res.json(erd)

  } catch (e: any) {
    console.error(e)
    errorHandler(e, req, res)
  }
}
