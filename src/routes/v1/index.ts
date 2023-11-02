import express from "express";
import user from "./user";
import auth from "./auth";
import verifyEmailRouter from "./verify-email";
import passwordRouter from "./password";

const router = express.Router()

router.use("/auth", auth)
router.use("/user", user)
router.use("", verifyEmailRouter)
router.use("", passwordRouter)


export default router
