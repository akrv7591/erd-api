import {ErdModel} from "../../sequelize-models/erd-api/Erd.model";
import * as Y from "yjs"

export type ErdSharedType = ReturnType<ErdModel['toYDocData']>

export const updateErdData = async (erdId: string, ymap: Y.Map<ErdSharedType>) => {
  const {erd, ...data} = ymap.toJSON() as ErdSharedType
  const entityCount = Object.keys(data.nodes).length

  await ErdModel.update({
    ...erd,
    data: {
      ...data,
      clients: {}
    },
    entityCount
  }, {
    where: {
      id: erdId
    }
  })
}
