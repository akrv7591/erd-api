import {RequestHandler} from "express";
import {errorHandler} from "../../../middleware/errorHandler";
import {EmailVerificationToken} from "../../../sequelize-models/erd-api/EmailVerificationToken.model";
import httpStatus from "http-status";

interface Params {
  token: string
}

export const verifyTokenDetail: RequestHandler<Params> = async (req, res) => {
  try {
    const data = await EmailVerificationToken.findOne({
      where: {
        token: req.params.token
      }
    })

    if (!data) {
      return res.sendStatus(httpStatus.NOT_FOUND)
    }

    res.json(data)
  } catch (e: any) {
    errorHandler(e, req, res)
  }
}