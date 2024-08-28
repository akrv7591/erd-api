import express from "express";
import {erdDeleteSchema, erdDetailSchema, erdUpsertSchema} from "../../../validations/erd";
import {ERD} from "../../../constants/erd";
import {pagination} from "../../../middleware/pagination";
import {erdList} from "./erdList";
import {erdUpsert} from "./erdUpsert";
import {erdDelete} from "./erdDelete";
import {erdDetail} from "./erdDetail";
import validate from "../../../middleware/validate";

const erdRouter = express.Router()

erdRouter.get(
  ERD.ENDPOINTS.erdDetail,
  validate(erdDetailSchema),
  erdDetail
)
erdRouter.delete(
  ERD.ENDPOINTS.erdDelete,
  validate(erdDeleteSchema),
  erdDelete
)
erdRouter.get(
  ERD.ENDPOINTS.erdList,
  pagination({searchFields: ['name'], like: true}),
  erdList
)
erdRouter.put(
  ERD.ENDPOINTS.erdUpsert,
  validate(erdUpsertSchema),
  erdUpsert
)


export default erdRouter
