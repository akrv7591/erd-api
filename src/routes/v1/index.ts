import authRouter from './auth.route';
import passwordRouter from './password.route';
import verifyEmailRouter from './verifyEmail.route';
import express from "express";
import user from "./user";

const router = express.Router()

router.use("/auth", authRouter)
router.use("/user", user)
router.use([verifyEmailRouter, passwordRouter])


export default router
