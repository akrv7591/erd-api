import {internalErrorHandler} from "../../../../utils/errorHandler";
import {EntityModel} from "../../../../sequelize-models/erd-api/Entity.model";
import {GetRequest} from "../../../../types/types";

export type EntityCountParams = {
  erdId: string
}

export const entityCount: GetRequest<EntityCountParams> = async (req, res) => {
  try {
    const {erdId} = req.params
    const count = await EntityModel.count({
      where: {
        erdId
      }
    })

    res.json({count})
  } catch (e) {
    internalErrorHandler(res, e)
  }
}

