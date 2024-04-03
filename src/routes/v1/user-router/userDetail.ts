import {RequestHandler} from "express";
import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import {ProfileModel} from "../../../sequelize-models/erd-api/Profile.model";
import {StaticFileModel} from "../../../sequelize-models/erd-api/StaticFile";
import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {COMMON} from "../../../constants/common";
import {HttpStatusCode} from "axios";

export type UserDetailRequestParams = {
  userId: string
}

export const userDetail: RequestHandler<UserDetailRequestParams> = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      where: {
        id: req.params.userId
      },
      include: [{
        model: ProfileModel,

        include: [StaticFileModel]
      }]
    })

    if (!user) {
      return errorHandler(req, res, HttpStatusCode.NotFound, COMMON.API_ERRORS.NOT_FOUND)
    }

    return res.json(user)
  } catch (e) {
    console.log(e)
    internalErrorHandler(e, req, res)
  }
}
