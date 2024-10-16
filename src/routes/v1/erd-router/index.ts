import {Router} from "express";
import {list} from "./list";
import {erdSchemas} from "../../../validations/erd-schemas";
import validate from "../../../middleware/validate";
import {addOrUpdate} from "./add-or-update";
import {remove} from "./remove";
import {S3Util} from "../../../utils/s3Util";

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

erdRouter.delete(
  "/:erdId",
  validate(erdSchemas.remove),
  remove
)

export {
  erdRouter
}
