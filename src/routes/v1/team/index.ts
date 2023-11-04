import express from "express";
import {pagination} from "../../../middleware/pagination";
import {list} from "./list";
import {upsert} from "./upsert";

const teamRouter = express.Router()

teamRouter.get("", pagination({searchFields: ['name'], like: true}), list)
teamRouter.put("", upsert)

export default teamRouter
