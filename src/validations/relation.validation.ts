import {body, param} from "express-validator";
import {isCuid} from "@paralleldrive/cuid2";

export const relationCreateValidations = [
  body("id").exists().isString().custom(value => isCuid(value)),
  body("source").exists().isString(),
  body("target").exists().isString(),
  body("markerEnd").exists().isString(),
  param("erdId").exists().isString().custom(value => isCuid(value))
]

export const relationDeleteValidations = [
  param("erdId").exists().isString().custom(value => isCuid(value)),
  param("relationId").exists().isString().custom(value => isCuid(value))
]
