import {Erd} from "../../sequelize-models/erd-api/Erd";
import * as Y from "yjs"

export type ErdSharedType = ReturnType<Erd['toYDocData']>

export const updateErdData = async (erdId: string, ymap: Y.Map<ErdSharedType>) => {
  const {erd, ...data} = ymap.toJSON() as ErdSharedType
  const entityCount = Object.keys(data.nodes).length

  await Erd.update({
    ...erd,
    data,
    entityCount
  }, {
    where: {
      id: erdId
    }
  })
}
