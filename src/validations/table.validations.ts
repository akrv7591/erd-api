import {body} from "express-validator";

export const tableValidations = [
  body("id").exists().isString(),
  body("position").exists().customSanitizer(data => JSON.stringify(data)),
  body("type").exists().isString(),
  body("data").exists()
]

export const bulkTableValidations = [
  body("tableList").exists().toArray().isArray().customSanitizer(value => value.map((table: any) => ({...table, position: JSON.stringify(table.position)}))),
]
