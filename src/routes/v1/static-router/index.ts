import {Router} from "express";
import {staticDetail} from "./staticDetail";

const staticRouter = Router({mergeParams: true})

staticRouter.get(
  "/:staticFileId",
  staticDetail
)

export { staticRouter }
