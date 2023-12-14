import {body} from "express-validator"

export const erdSchema = [
  body("id").optional().isString(),
  body("name").exists().isString(),
  body("description").optional().isString(),
  body("isPublic").toBoolean().isBoolean(),
  body("users").optional().isArray()
]
