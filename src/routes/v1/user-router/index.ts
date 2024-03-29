import express from "express";
import {S3Util} from "../../../utils/s3Util";
import {userDetail} from "./userDetail";
import {userPatch} from "./userPatch";
import validate from "../../../middleware/validate";
import {userDetailOrPatchSchema} from "../../../validations/user";

const userRouter = express.Router({mergeParams: true})

userRouter.get(
  "/:userId",
  validate(userDetailOrPatchSchema),
  userDetail
)

userRouter.patch(
  "/:userId",
  validate(userDetailOrPatchSchema),
  S3Util.fileUpload("user/profile/").single("profilePicture"),
  userPatch
)

export default userRouter
