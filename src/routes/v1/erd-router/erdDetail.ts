import {ErdModel} from "../../../sequelize-models/erd-api/Erd.model";
import {TeamModel} from "../../../sequelize-models/erd-api/Team.model";
import {GetRequest} from "../../../types/types";
import {internalErrorHandler} from "../../../utils/errorHandler";

export type ErdDetailParams = {
  erdId: string
}

export type ErdDetailQuery = {}

export const erdDetail: GetRequest<ErdDetailParams> = async (req, res) => {

  try {
    const data = await ErdModel.findByPk(req.params.erdId, {
      include: [{
        model: TeamModel,
      }],
    })

    res.json(data)
  } catch (e) {
    internalErrorHandler(res, e)
  }
}
