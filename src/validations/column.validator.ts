import {body, param} from "express-validator";
import {IColumn} from "../sequelize-models/erd-api/Column.model";

const columnKeys = [
  "id",
  "name",
  "primary",
  "type",
  "foreignKey",
  "null",
  "unique",
  "unsigned",
  "autoIncrement",
  "comment",
  "order"
]

export const columnBulkValidator = [
  body("columnList").exists().toArray().isArray().customSanitizer((columnList: IColumn[]) => columnList.map(column => {
    Object.keys(column).forEach(key => {
      if (!columnKeys.includes(key)) throw new Error(`Required fields does not exist, fieldName: ${key}`)
    })
    return column
  }))
]

export const columnUpsertValidation = [
  body("id").exists().isString(),
  body("name").exists().isString(),
  body("primary").exists().toBoolean().isBoolean(),
  body("type").exists().isString(),
  body("foreignKey").exists().toBoolean().isBoolean(),
  body("null").exists().toBoolean().isBoolean(),
  body("unique").exists().toBoolean().isBoolean(),
  body("unsigned").exists().toBoolean().isBoolean(),
  body("autoIncrement").exists().toBoolean().isBoolean(),
  body("comment").exists().isString(),
  body("order").exists().toInt().isInt(),
  param("tableId").exists().isString(),
]
