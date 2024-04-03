import express from "express";
import userRouter from "./user-router";
import authRouter from "./auth-router";
import verifyEmailRouter from "./verify-email";
import passwordRouter from "./password-router";
import teamRouter from "./team-router";
import erdRouter from "./erd-router";
import authorization from "../../middleware/authorization";
import authLimiter from "../../middleware/authLimiter";


const router = express.Router()

router.use("/auth", authLimiter, authRouter)
router.use("/users", authorization, userRouter)
router.use("/team", authorization, teamRouter)
router.use("/erd", authorization, erdRouter)

router.use("", verifyEmailRouter)
router.use("", passwordRouter)


export default router
