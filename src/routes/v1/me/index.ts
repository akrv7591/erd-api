import { Router } from "express";
import { userData } from "./userData";

const meRouter = Router()

meRouter.get("", userData)

export {
  meRouter
}
