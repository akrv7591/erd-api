import express from "express";
import {pagination} from "../../../middleware/pagination";
import {list} from "./list";
import {put} from "./put";
import {validateSchemas} from "../../../middleware/validateSchemas";
import {erdSchema} from "../../../validations/erd.validation";
import tableRouter from "./table-router";
import {deleteErd} from "./deleteErd";

const erdRouter = express.Router()

erdRouter.use("/:erdId/table", tableRouter)
erdRouter.delete("/:erdId", deleteErd)
erdRouter.get("", pagination({searchFields: ['name'], like: true}), list)
erdRouter.put("", validateSchemas(erdSchema), put)

export default erdRouter
