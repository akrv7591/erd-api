import {RequestHandler} from "express";
import {errorHandler} from "../../../middleware/errorHandler";
import {matchedData} from "express-validator";
import {Erd} from "../../../sequelize-models/erd-api/Erd.model";
import {UserErd} from "../../../sequelize-models/erd-api/UserErd.model";
import {IUser, User} from "../../../sequelize-models/erd-api/User.model";
import {Op, Transaction} from "sequelize";
import {erdSequelize} from "../../../sequelize-models/erd-api";
import httpStatus from "http-status";


export const put: RequestHandler = async (req, res) => {
  let transaction: Transaction | null = null
  try {
    transaction = await erdSequelize.transaction()
    const {users, ...data} = matchedData(req) as any
    const [erd, created] = await Erd.upsert(data, {
      transaction
    })

    if (!created) {
      await erd.reload({
        include: [{
          model: User
        }]
      })
      const updatedUserIds = users.reduce((idList: string[], user: IUser) => {
        if (user.id) {
          idList.push(user.id)
        }
        return idList
      }, [])


      await UserErd.destroy({
        where: {
          erdId: erd.id,
          userId: {
            [Op.notIn]: updatedUserIds
          }
        },
        transaction
      })
    }

    if (users && users.length > 0) {
      for (let user of users) {
        try {
          const createdUser = await User.create(user, {transaction})
          user.UserErd.userId = createdUser.id
        } catch (e) {
          const existedUser = await User.findOne({
            where: {
              email: user.email
            }
          })
          user.UserErd.userId = existedUser?.id
        }

        user.UserErd.erdId = erd.id
        await UserErd.upsert(user.UserErd, {transaction})
      }
    }

    await transaction.commit()

    res.status(created ? httpStatus.CREATED : httpStatus.OK).json(erd)

  } catch (e: any) {
    await transaction?.rollback()
    console.error(e)
    errorHandler(e, req, res)
  }
}
