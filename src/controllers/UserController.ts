import {User} from "../sequelize-models/erd-api/User.model";
import {Profile} from "../sequelize-models/erd-api/Profile";
import {StaticFile} from "../sequelize-models/erd-api/StaticFile";
import httpStatus from "http-status";
import express, {RequestHandler} from "express";
import {Team} from "../sequelize-models/erd-api/Team.model";
import {internalErrorHandler} from "../middleware/internalErrorHandler";


export class UserController {
  static fetchUserWithProfile: RequestHandler<any> = async (req, res) => {
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

  static patchUserWithProfile: RequestHandler = async (req, res) => {
    try {
      const file = req.file as Express.MulterMinIOStorage.File
      const { name, id } = req.body

      const user = await User.findByPk(id, {
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

  static setPassword: RequestHandler = async (req, res) => {
    try {

    } catch (e) {
      internalErrorHandler(e, req, res)
    }
  }

  static fetchUserList: RequestHandler = async (req: express.Request, res: express.Response) => {
    try {
      const teamId = req.query['teamId']

      if (!teamId) return res.status(httpStatus.BAD_REQUEST).json({message: "teamId is required"})

      const data = await User.findAndCountAll({
        ...req.pagination,
        include: [{
          model: Team,
          where: {
            id: teamId
          },
          required: true
        }]
      })

      res.json(data)
    } catch (e) {
      console.error(e)
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
