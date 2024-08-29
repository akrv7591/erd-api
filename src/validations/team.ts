import Joi from 'joi';
import {isCuid} from "@paralleldrive/cuid2";
import {PutTeamBody} from "../routes/v1/team-router/teamUpsert";
import {TeamDeleteUserBody, TeamDeleteUserParams} from "../routes/v1/team-router/teamDeleteUser";
import {TeamUserInviteBody, TeamUserInviteParams} from "../routes/v1/team-router/teamInviteUser";
import {ROLE} from "../enums/role";
import {TeamUserDetailParams} from "../routes/v1/team-router/teamUserDetail";

const teamId = {
  params: Joi.object().keys({
    teamId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Team id must be a string',
      'string.custom': 'Team id must be a valid cuid',
    }),
  }),
};


const put = {
  body: Joi.object<PutTeamBody>().keys({
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

const userDelete = {
  params: Joi.object<TeamDeleteUserParams>().keys({
    teamId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Team id must be a string',
      'string.custom': 'Team id must be a valid cuid',
    })
  }),
  body: Joi.object<TeamDeleteUserBody>().keys({
    userId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'User id must be a string',
      'string.custom': 'User id must be a valid cuid',
    })
  })
}

const inviteUser = {
  params: Joi.object<TeamUserInviteParams>().keys({
    teamId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Team id must be a string',
      'string.custom': 'Team id must be a valid cuid',
    })
  }),
  body: Joi.object<TeamUserInviteBody>().keys({
    email: Joi.string().required().email().messages(({
      'string.base': "Email should be string",
      'string.custom': "Email should be valid email"
    })),
    role: Joi.string().required().custom(value => value in ROLE).messages({
      'string.base': "Role should be string",
      'string.custom': "Role should be one of ROLE constant"
    })
  })
}


const userTeamDetail = {
  params: Joi.object<TeamUserDetailParams>().keys({
    teamId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Team id must be a string',
      'string.custom': 'Team id must be a valid cuid',
    }),
    userId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'User id must be a string',
      'string.custom': 'User id must be a valid cuid',
    })
  }),
}

export const teamSchemas = {
  teamId,
  put,
  userDelete,
  inviteUser,
  userTeamDetail,
}
