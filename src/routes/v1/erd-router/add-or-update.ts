import {PutRequest} from "../../../types/types";
import {Erd, ICErd} from "../../../sequelize-models/erd-api/Erd";
import {internalErrorHandler} from "../../../utils/errorHandler";
import {StaticFile} from "../../../sequelize-models/erd-api/StaticFile";
import {Transaction} from "sequelize";
import {erdSequelize} from "../../../sequelize-models/erd-api";

export interface ErdAddOrUpdateBody extends ICErd {}

export const addOrUpdate: PutRequest<{}, ErdAddOrUpdateBody> = async (req, res) => {
  const icErd = req.body
  let transaction: Transaction | undefined = undefined

  try {
    transaction = await erdSequelize.transaction()
    const [data, created] = await Erd.upsert(icErd, {transaction})
    const file = req.file as Express.MulterMinIOStorage.File

    if (file) {
      const staticFile = await StaticFile.create({
        key: file.key,
        mime: file.mimetype,
        name: file.originalname,
      }, {transaction})

      data.thumbnailId = staticFile.id
      await data.save({transaction})
    }

    await transaction.commit()

    res.status(created? 201 : 200).json(data)

  } catch (error) {
    await transaction?.rollback()
    internalErrorHandler(res, error)
  }
}
