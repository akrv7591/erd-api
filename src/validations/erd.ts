import Joi from "joi";
import {isCuid} from "@paralleldrive/cuid2";
import {RequestValidationSchema} from "../types/types";
import {ErdDeleteParams} from "../routes/v1/erd-router/erdDelete";
import {ErdUpsertBody} from "../routes/v1/erd-router/erdUpsert";
import {ErdDetailParams} from "../routes/v1/erd-router/erdDetail";

export const erdUpsertSchema = {
  body: Joi.object<ErdUpsertBody>().keys({
    id: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'ERD id must be a string',
      'string.custom': 'ERD id must be a valid cuid',
    }),
    name: Joi.string().required(),
    description: Joi.optional(),
    isPublic: Joi.boolean().required(),
    teamId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Team id must be a string',
      'string.custom': 'Team id must be a valid cuid',
    }),
    tableNameCase: Joi.string().required().valid('pascal', 'snake', 'camel'),
    columnNameCase: Joi.string().required().valid('snake', 'camel'),
  })
}

export const erdDeleteSchema: RequestValidationSchema = {
  params: Joi.object<ErdDeleteParams>().keys({
    erdId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'erdId must be a string',
      'string.custom': 'erdId must be a valid cuid',
    })
  })
}

export const erdDetailSchema: RequestValidationSchema = {
  params: Joi.object<ErdDetailParams>().keys({
    erdId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'erdId must be a string',
      'string.custom': 'erdId must be a valid cuid',
    })
  })
}
