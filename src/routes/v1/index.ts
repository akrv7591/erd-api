import express from "express";
import userRouter from "./user-router";
import authRouter from "./auth-router";
import verifyEmailRouter from "./verify-email";
import passwordRouter from "./password-router";
import teamRouter from "./team-router";
import erdRouter from "./erd-router";
import isAuth from "../../middleware/isAuth";


const router = express.Router()

router.use("/auth", authRouter)
router.use("/user", isAuth, userRouter)
router.use("/team", isAuth, teamRouter)
router.use("/erd", isAuth, erdRouter)

router.use("", verifyEmailRouter)
router.use("", passwordRouter)


export default router
