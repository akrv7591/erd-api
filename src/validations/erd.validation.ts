import Joi from "joi";
import {isCuid} from "@paralleldrive/cuid2";
import {ICErdModel} from "../sequelize-models/erd-api/Erd.model";

export const erdUpsertSchema = {
  body: Joi.object<ICErdModel>().keys({
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
