import Joi from 'joi';
import {isCuid} from "@paralleldrive/cuid2";
import {TeamDetailOrDeleteParams} from "../routes/v1/team-router/teamDelete";
import {PutTeamRequestBody} from "../routes/v1/team-router/teamUpsert";
import {TeamDeleteUserRequestBody, TeamDeleteUserRequestParams} from "../routes/v1/team-router/teamDeleteUser";

export const teamIdSchema = {
  params: Joi.object().keys({
    teamId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Team id must be a string',
      'string.custom': 'Team id must be a valid cuid',
    }),
  }),
};


export const teamDetailOrDeleteSchema = {
  params: Joi.object<TeamDetailOrDeleteParams>().keys({
    teamId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Team id must be a string',
      'string.custom': 'Team id must be a valid cuid',
    }),
  }),
};

export const putTeamSchema = {
  body: Joi.object<PutTeamRequestBody>().keys({
    id: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Team id must be a string',
      'string.custom': 'Team id must be a valid cuid',
    }),
    name: Joi.string().required().messages({
      'string.base': 'Name must be a string',
    }),
    users: Joi.array().default([]).messages({
      'array.base': 'Users must be an array',
    })
  })
}

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
