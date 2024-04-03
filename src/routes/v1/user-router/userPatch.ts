import {RequestHandler} from "express";
import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import {ProfileModel} from "../../../sequelize-models/erd-api/Profile.model";
import {StaticFileModel} from "../../../sequelize-models/erd-api/StaticFile";
import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../../constants/common";

type UserPatchRequestBody = {
  name?: string
}

export const userPatch: RequestHandler<{}, UserPatchRequestBody> = async (req, res) => {
  try {
    const file = req.file as Express.MulterMinIOStorage.File
    const {name} = req.body

    const user = await UserModel.findByPk(req.authorizationUser?.id, {
      include: {
        model: ProfileModel,
        include: [StaticFileModel]
      }
    })

    if (!user) {
      return errorHandler(req, res, HttpStatusCode.NotFound, COMMON.API_ERRORS.NOT_FOUND)
    }

    if (!file && !name) {
      return errorHandler(req, res, HttpStatusCode.BadRequest, COMMON.API_ERRORS.BAD_REQUEST)
    }

    if (file) {
      await user.profile.image?.update({
        key: file.key,
        name: file.originalname,
        mime: file.mimetype
      })
    }

    if (name) {
      user.name = name
    }

    await user.save()
    await user.reload()

    res.json(user)

  } catch (e) {
    internalErrorHandler(e, req, res)
  }
}
