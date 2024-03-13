import {body} from "express-validator"

export const erdSchema = [
  body("id").optional().isString(),
  body("name").exists().isString(),
  body("description").optional().isString(),
  body("isPublic").toBoolean().isBoolean(),
  body("teamId").exists().isString(),
  body("tableNameCase").exists().isString().custom(v => ['pascal', 'snake', 'camel'].includes(v)),
  body("columnNameCase").exists().isString().custom(v => ['snake', 'camel'].includes(v)),
]
