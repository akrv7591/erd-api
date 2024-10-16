import express from "express";
import validate from "../../../middleware/validate";
import {teamSchemas} from "../../../validations/team";
import {userRouter} from "./user-router";
import {add} from "./add";
import {update} from "./update";
import {remove} from "./remove";
import {list} from "./list";

const teamRouter = express.Router({mergeParams: true})

teamRouter.use("/:teamId/users", userRouter)

teamRouter.patch(
  "/:teamId",
  validate(teamSchemas.update),
  update
)

teamRouter.delete(
  "/:teamId",
  validate(teamSchemas.delete),
  remove
)

teamRouter.post(
  "",
  validate(teamSchemas.add),
  add
)

teamRouter.get(
  "",
  list
)

export {
  teamRouter
}
