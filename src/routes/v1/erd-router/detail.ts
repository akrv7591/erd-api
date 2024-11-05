import {GetRequest} from "../../../types/types";
import {Erd} from "../../../sequelize-models/erd-api/Erd";
import {internalErrorHandler} from "../../../utils/errorHandler";

export interface ErdDetailParams {
  erdId: string
}

export const detail: GetRequest<ErdDetailParams> = async (req, res) => {
  const {erdId} = req.params

  try {
    const erd = await Erd.findByPk(erdId)

    if (!erd) {
      return res.sendStatus(404)
    }

    res.json(erd)

  } catch (error) {
    internalErrorHandler(res, error)
  }
}
