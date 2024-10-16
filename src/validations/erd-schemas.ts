import Joi from "joi";
import {ErdAddOrUpdateBody} from "../routes/v1/erd-router/add-or-update";
import {ErdRemoveParams} from "../routes/v1/erd-router/remove";

const addOrUpdate = {
  body: Joi.object<ErdAddOrUpdateBody>().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().default("").min(0),
    isPublic: Joi.boolean().required(),
    tableNameCase: Joi.string().required(),
    columnNameCase: Joi.string().required(),
    entityCount: Joi.number().required(),
    teamId: Joi.string().required(),
    userId: Joi.string().required(),
    thumbnailId: Joi.string().default(null)
  })
}

const remove = {
  params: Joi.object<ErdRemoveParams>().keys({
    erdId: Joi.string().required()
  })
}

export const erdSchemas = {
  addOrUpdate,
  remove
}
