import {Router} from "express";
import {teamList} from "./team-list";
import {detail} from "./detail";

const userRouter = Router({mergeParams: true})

userRouter.get(
  "/teams",
  teamList,
)

userRouter.get(
  "/:userId",
  detail
)

export default userRouter
