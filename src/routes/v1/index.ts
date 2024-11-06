import express from "express";
import userRouter from "./user-router";
import {teamRouter} from "./team-router";
import {logToWebhookRouter} from "./logto-webhook-router";
import {logToAuth} from "../../middleware/logtoAuth";
import teamInvitationRouter from "./team-invitation";
import {rolesRouter} from "./roles-router";
import {erdRouter} from "./erd-router";
import {staticRouter} from "./static-router";
import { meRouter } from "./me";

const router = express.Router()

router.use("/logto-webhook", logToWebhookRouter)
router.use(logToAuth)
router.use("/me", meRouter)
router.use("/users", userRouter)
router.use("/teams", teamRouter)
router.use("/team-invitations", teamInvitationRouter)
router.use("/roles", rolesRouter)
router.use("/erds", erdRouter)
router.use("/static-files", staticRouter)


export default router
