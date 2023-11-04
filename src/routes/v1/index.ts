import express from "express";
import userRouter from "./user";
import auth from "./auth";
import verifyEmailRouter from "./verify-email";
import passwordRouter from "./password";
import isAuth from "../../middleware/isAuth";
import teamRouter from "./team";

const router = express.Router()

router.use("/auth", auth)
router.use("/user", isAuth, userRouter)
router.use("/team", isAuth, teamRouter)
router.use("", verifyEmailRouter)
router.use("", passwordRouter)


export default router
