import {DeleteRequest} from "../../../types/types";
import {Erd} from "../../../sequelize-models/erd-api/Erd";
import {internalErrorHandler} from "../../../utils/errorHandler";

export interface ErdRemoveParams {
  erdId: string
}

export const remove: DeleteRequest<ErdRemoveParams> = async (req, res) => {
  const {erdId} = req.params

  try {
    const erd = await Erd.findByPk(erdId)

    if (!erd) {
      return res.sendStatus(404)
    }

    await erd.destroy()

    res.json(erd)

  } catch (error) {
    internalErrorHandler(res, error)
  }
}
