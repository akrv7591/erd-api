import express from "express";
import {pagination} from "../../../middleware/pagination";
import {S3Util} from "../../../utils/s3Util";
import {fetchUser} from "./fetchUser";
import {patchUser} from "./patchUser";
import {fetchUserList} from "./fetchUserList";

const userRouter = express.Router({mergeParams: true})

userRouter.get(
  "/:userId",
  fetchUser
)

userRouter.patch(
  "/:userId",
  S3Util.fileUpload("user/profile/").single("profilePicture"),
  patchUser
)

userRouter.get(
  "",
  pagination({searchFields: ['name'], like: true}),
  fetchUserList
)

export default userRouter
