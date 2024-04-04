import {UserModel} from "../../../sequelize-models/erd-api/User.model";
import {ProfileModel} from "../../../sequelize-models/erd-api/Profile.model";
import {StaticFileModel} from "../../../sequelize-models/erd-api/StaticFile";
import {errorHandler, internalErrorHandler} from "../../../utils/errorHandler";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../../constants/common";
import {PatchRequest} from "../../../types/types";

export type UserPatchParams = {}

export type UserPatchBody = {
  name?: string
}

export const userPatch: PatchRequest<UserPatchParams, UserPatchBody> = async (req, res) => {
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
      return errorHandler(res, HttpStatusCode.NotFound, COMMON.API_ERRORS.NOT_FOUND)
    }

    if (!file && !name) {
      return errorHandler(res, HttpStatusCode.BadRequest, COMMON.API_ERRORS.BAD_REQUEST)
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
    internalErrorHandler(res, e)
  }
}
