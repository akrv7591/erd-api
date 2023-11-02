import express from "express";
import list from "./list";
import get from "./get";

const router = express.Router()

router.use("/:userId", get)
router.use("", list)

export default router
