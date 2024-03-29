import {Router} from "express";
import {internalErrorHandler} from "../../../../middleware/errorHandler";
import {EntityModel} from "../../../../sequelize-models/erd-api/Entity.model";

const entityCount = Router({mergeParams: true})

entityCount.get<{erdId: string}>("", async (req, res) => {
  try {
    const count = await EntityModel.count({where: {erdId: req.params.erdId}})

    res.json({count})
  } catch (e) {
    internalErrorHandler(e, req, res)
  }
})

export default entityCount
