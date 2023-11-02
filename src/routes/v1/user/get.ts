import express from "express";
import httpStatus from "http-status";
import {User} from "../../../sequelize-models/erd-api/User.model";

const router = express.Router({mergeParams: true})

router.get<{userId: string}>("", async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.userId
      }
    })

    if (!user) return res.sendStatus(httpStatus.NOT_FOUND)

    return res.json(user)
  } catch (e) {
    console.log(e)
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
  }
})

export default router
