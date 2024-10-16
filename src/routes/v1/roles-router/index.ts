import {Router} from "express";
import {rolesList} from "./rolesList";

const rolesRouter = Router()

rolesRouter.get("", rolesList)

export {
  rolesRouter
}
