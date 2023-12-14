import {body} from "express-validator"

export const teamSchema = [
  body("id").optional().isString(),
  body("name").exists().isString(),
  body("users").optional().isArray(),
]
