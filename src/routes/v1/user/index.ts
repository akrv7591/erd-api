import express from "express";
import {list} from "./list";
import {pagination} from "../../../middleware/pagination";
import get from "./get";

const userRouter = express.Router()

userRouter.use("/:userId", get)
userRouter.use("", pagination({searchFields: ['name'], like: true}), list)

export default userRouter
