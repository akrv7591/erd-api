import {Request, Response} from "express";
import httpStatus from "http-status";
import {User} from "../../../sequelize-models/erd-api/User.model";
import {Profile} from "../../../sequelize-models/erd-api/Profile";
import {StaticFile} from "../../../sequelize-models/erd-api/StaticFile";

type UserRequestParams = {
  userId: string
}

export async function fetchUser (req: Request<UserRequestParams>, res: Response) {
  try {
    if (!req.params.userId) return res.sendStatus(httpStatus.BAD_REQUEST)

    const user = await User.findOne({
      where: {
        id: req.params.userId
      },
      include: [{
        model: Profile,

        include: [StaticFile]
      }]
    })

    if (!user) return res.sendStatus(httpStatus.NOT_FOUND)

    return res.json(user)
  } catch (e) {
    console.log(e)
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
  }
}
