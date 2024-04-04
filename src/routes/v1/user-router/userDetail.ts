import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import {ProfileModel} from "../../../sequelize-models/erd-api/Profile.model";
import {StaticFileModel} from "../../../sequelize-models/erd-api/StaticFile";
import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {COMMON} from "../../../constants/common";
import {HttpStatusCode} from "axios";
import {GetRequest} from "../../../types/types";

export type UserDetailParams = {
  userId: string
}

export const userDetail: GetRequest<UserDetailParams> = async (req, res) => {
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
      return errorHandler(res, HttpStatusCode.NotFound, COMMON.API_ERRORS.NOT_FOUND)
    }

    return res.json(user)
  } catch (e) {
    console.log(e)
    internalErrorHandler(res, e)
  }
}
