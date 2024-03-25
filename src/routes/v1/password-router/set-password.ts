import {RequestHandler} from "express";
import httpStatus from "http-status";
import argon2 from "argon2"
import {User} from "../../../sequelize-models/erd-api/User.model";

export interface SetPasswordBody {
  password: string | null | undefined;
  newPassword: string;
}

export const setPassword: RequestHandler<{}, {}, SetPasswordBody> = async (req, res) => {
  try {

    const {password, newPassword} = req.body

    const user = await User.unscoped().findOne({
      where: {
        id: req.authorizationUser?.id,
      }
    })

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({message: "User not found"})
    }

    if (user.isPasswordSet) {

      if (!password) {
        return res.status(httpStatus.BAD_REQUEST).json({message: "Password is required"})
      }

      const passwordHash = await argon2.hash(password)

      if (user.password !== passwordHash) {
        return res.status(httpStatus.UNAUTHORIZED).json({message: "Incorrect password"})
      }

      if (password === newPassword) {
        return res.status(httpStatus.BAD_REQUEST).json({message: "New password should be different from old password"})
      }
    }

    const newPasswordHash = await argon2.hash(newPassword)

    await user.update({
      password: newPasswordHash,
      isPasswordSet: true
    })

    res.sendStatus(httpStatus.OK)
  } catch (e) {
    console.error(e)
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
  }
}
