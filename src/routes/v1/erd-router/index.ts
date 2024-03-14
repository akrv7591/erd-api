import express from "express";
import {pagination} from "../../../middleware/pagination";
import {list} from "./list";
import {put} from "./put";
import {validateSchemas} from "../../../middleware/validateSchemas";
import {erdSchema} from "../../../validations/erd.validation";
import {deleteErd} from "./deleteErd";
import {detail} from "./detail";
import entityRouter from "./entity";

const erdRouter = express.Router()

erdRouter.use("/:erdId/entity", entityRouter)
erdRouter.delete("/:erdId", deleteErd)
erdRouter.get("/:erdId", detail)
erdRouter.get("", pagination({searchFields: ['name'], like: true}), list)
erdRouter.put("", validateSchemas(erdSchema), put)

export default erdRouter
