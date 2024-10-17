import {Erd} from "../../sequelize-models/erd-api/Erd";
import {YMap} from "yjs/dist/src/types/YMap";
import {applyObjToYjs} from "./util";

export const createErdData = async (erdId: string, ymap: YMap<unknown>) => {
  const erd = await Erd.findByPk(erdId)

  if (!erd) {
    throw new Error("ERD NOT FOUND")
  }

  const jsonData = erd.toYDocData()

  if (!jsonData.entityConfigs) {
    jsonData.entityConfigs = {}
  }

  applyObjToYjs(ymap, jsonData)
}