import {ListRequest} from "../../../types/types";
import {Erd} from "../../../sequelize-models/erd-api/Erd";
import {internalErrorHandler} from "../../../utils/errorHandler";

interface ErdListQuery {
  teamId: string
}


export const list: ListRequest<{}, {}, ErdListQuery> = async (req, res) => {
  const {teamId} = req.query

  try {
    const data = await Erd.findAll({
      where: {
        teamId
      },
      attributes: {
        exclude: ['data']
      }
    })

    res.json(data)

  } catch (error) {
    internalErrorHandler(res, error)
  }
}
