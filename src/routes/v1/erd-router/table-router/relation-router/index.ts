import express from "express";
import {relationList} from "./relationList";

const relationRouter = express.Router({mergeParams: true})

relationRouter.get("", relationList)

export default relationRouter
