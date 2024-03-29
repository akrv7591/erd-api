import express from "express";
import {pagination} from "../../../middleware/pagination";
import {list} from "./list";
import {put} from "./put";
import {erdUpsertSchema} from "../../../validations/erd.validation";
import {deleteErd} from "./deleteErd";
import {detail} from "./detail";
import entityRouter from "./entity";
import validate from "../../../middleware/validate";

const erdRouter = express.Router()

erdRouter.use("/:erdId/entity", entityRouter)
erdRouter.delete("/:erdId", deleteErd)
erdRouter.get("/:erdId", detail)
erdRouter.get("", pagination({searchFields: ['name'], like: true}), list)
erdRouter.put("", validate(erdUpsertSchema), put)

export default erdRouter
