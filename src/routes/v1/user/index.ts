import express from "express";
import list from "./list";
import get from "./get";

const userRouter = express.Router()

userRouter.use("/:userId", get)
userRouter.use("", list)

export default userRouter
