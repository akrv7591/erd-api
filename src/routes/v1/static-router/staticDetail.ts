import {GetRequest} from "../../../types/types";
import {internalErrorHandler} from "../../../utils/errorHandler";
import {StaticFile} from "../../../sequelize-models/erd-api/StaticFile";

interface StaticDetailRequest {
  staticFileId: string
}

export const staticDetail: GetRequest<StaticDetailRequest> = async (req, res) => {
  try {
    const {staticFileId} = req.params
    const data = await StaticFile.findByPk(staticFileId)

    if (!data) {
      res.sendStatus(404)
    }

    res.json(data)

  } catch (e) {
    internalErrorHandler(res, e)
  }
}
