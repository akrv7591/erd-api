import Joi from "joi";
import {TeamDeleteUserRequestBody, TeamDeleteUserRequestParams} from "../routes/v1/team-router/teamDeleteUser";
import {isCuid} from "@paralleldrive/cuid2";

export const teamDeleteUserSchema = {
  params: Joi.object<TeamDeleteUserRequestParams>().keys({
    teamId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Team id must be a string',
      'string.custom': 'Team id must be a valid cuid',
    })
  }),
  body: Joi.object<TeamDeleteUserRequestBody>().keys({
    userId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'User id must be a string',
      'string.custom': 'User id must be a valid cuid',
    })
  })
}
