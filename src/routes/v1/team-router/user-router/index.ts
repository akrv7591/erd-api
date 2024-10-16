import express from "express";
import validate from "../../../../middleware/validate";
import {teamSchemas} from "../../../../validations/team";
import {list} from "./list";
import {remove} from "./remove";
import {updateRole} from "./update-role";

const userRouter = express.Router({mergeParams: true})

const {userSchemas} = teamSchemas

userRouter.put(
  "/:userId/role",
  validate(userSchemas.updateRole),
  updateRole
)

userRouter.delete(
  "/:userId",
  validate(userSchemas.remove),
  remove
)

userRouter.get(
  "",
  validate(userSchemas.list),
  list
)

export {
  userRouter
}
