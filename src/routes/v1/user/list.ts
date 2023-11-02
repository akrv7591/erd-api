import express from "express";
import httpStatus from 'http-status'
import {User} from "../../../sequelize-models/erd-api/User.model";

const router = express.Router()

router.get("", async (_, res) => {
  try {
    const data = await User.findAndCountAll()

    res.json(data)
  } catch (e) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR);
  }
})

export default router
