import {Router} from "express";
import {list} from "./list";
import {erdSchemas} from "../../../validations/erd-schemas";
import validate from "../../../middleware/validate";
import {addOrUpdate} from "./add-or-update";
import {remove} from "./remove";
import {S3Util} from "../../../utils/s3Util";
import { detail } from "./detail";

const erdRouter = Router({mergeParams: true})

erdRouter.get(
  "",
  list
)

erdRouter.put(
  "",
  S3Util.fileUpload("erds/thumbnails/").single("file"),
  validate(erdSchemas.addOrUpdate),
  addOrUpdate
)

erdRouter.get(
  "/:erdId",
  validate(erdSchemas.detail),
  detail
)

erdRouter.delete(
  "/:erdId",
  validate(erdSchemas.remove),
  remove
)

export {
  erdRouter
}
