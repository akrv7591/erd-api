import express from "express";
import entityCount from "./count";

const entityRouter = express.Router({mergeParams: true})

entityRouter.get("/count", entityCount)

export default entityRouter
