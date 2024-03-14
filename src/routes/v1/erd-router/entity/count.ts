import {Router} from "express";
import {errorHandler} from "../../../../middleware/errorHandler";
import {Entity} from "../../../../sequelize-models/erd-api/Entity.model";

const entityCount = Router({mergeParams: true})

entityCount.get<{erdId: string}>("", async (req, res) => {
  try {
    const count = await Entity.count({where: {erdId: req.params.erdId}})

    res.json({count})
  } catch (e) {
    errorHandler(e, req, res)
  }
})

export default entityCount
