import express from "express";
import {pagination} from "../../../middleware/pagination";
import {list} from "./list";
import {upsert} from "./upsert";
import {validateSchemas} from "../../../middleware/validateSchemas";
import {teamSchema} from "../../../validations/team.validation";

const teamRouter = express.Router()

teamRouter.get("", pagination({searchFields: ['name'], like: true}), list)
teamRouter.put("", validateSchemas(teamSchema), upsert)

export default teamRouter
