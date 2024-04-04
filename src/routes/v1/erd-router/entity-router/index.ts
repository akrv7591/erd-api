import express from "express";
import {entityCount} from "./entityCount";
import {ERD} from "../../../../constants/erd";

const entityRouter = express.Router({mergeParams: true})

entityRouter.use(
  ERD.ENDPOINTS.ENTITY_ROUTER.count,
  entityCount
)

export default entityRouter
