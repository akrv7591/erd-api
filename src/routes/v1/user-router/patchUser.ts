import {Request, Response} from "express";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {Profile} from "../../../sequelize-models/erd-api/Profile";
import {StaticFile} from "../../../sequelize-models/erd-api/StaticFile";
import httpStatus from "http-status";
import {internalErrorHandler} from "../../../middleware/internalErrorHandler";

type PatchUserParams = {}
type PathUserBody = {
  name?: string
}

export async function patchUser(req: Request<PatchUserParams, PathUserBody>, res: Response){
  try {
    const file = req.file as Express.MulterMinIOStorage.File
    const { name } = req.body

    const user = await User.findByPk(req.authorizationUser?.id, {
      include: {
        model: Profile,
        include: [StaticFile]
      }
    })

    if (!user) return res.status(httpStatus.NOT_FOUND).json({message: "user not found"})

    if (!file && !name) {
      return res.sendStatus(httpStatus.BAD_REQUEST)
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

    res.json()

  } catch (e) {
    internalErrorHandler(e, req, res)
  }
}
