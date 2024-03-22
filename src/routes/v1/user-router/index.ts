import express from "express";
import {pagination} from "../../../middleware/pagination";
import {UserController} from "../../../controllers/UserController";
import {S3Util} from "../../../utils/s3Util";

const userRouter = express.Router({mergeParams: true})

userRouter.get(
  "/:userId",
  UserController.fetchUserWithProfile
)

userRouter.patch(
  "/:userId",
  S3Util.fileUpload("user/profile/").single("profilePicture"),
  // multer({dest: "temp"}).single("profilePicture"),
  UserController.patchUserWithProfile
)

userRouter.get(
  "",
  pagination({searchFields: ['name'], like: true}),
  UserController.fetchUserList
)

export default userRouter
