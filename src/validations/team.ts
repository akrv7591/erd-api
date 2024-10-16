import Joi from 'joi';
import {isCuid} from "@paralleldrive/cuid2";
import {AddTeamBody} from "../routes/v1/team-router/add";
import {UpdateTeamBody, UpdateTeamParams} from "../routes/v1/team-router/update";
import {DeleteTeamParams} from "../routes/v1/team-router/remove";
import {DeleteUserFromTeamParams} from "../routes/v1/team-router/user-router/remove";
import {UpdateTeamUserRoleBody, UpdateTeamUserRoleParams} from "../routes/v1/team-router/user-router/update-role";
import {TeamUserListParams} from "../routes/v1/team-router/user-router/list";

const add = {
  body: Joi.object<AddTeamBody>().keys({
    name: Joi.string().required().messages({
      'string.base': 'Name must be a string',
    }),
    description: Joi.string().default("").min(0),
  })
}

const update = {
  params: Joi.object<UpdateTeamParams>().keys({
    teamId: Joi.string().required().messages({
      'string.base': 'Team id must be a string',
    })
  }),
  body: Joi.object<UpdateTeamBody>().keys({
    name: Joi.string().required().messages({
      'string.base': 'Name must be a string',
    }),
    description: Joi.string().min(0)
  })
}

const deleteSchema = {
  params: Joi.object<DeleteTeamParams>().keys({
    teamId: Joi.string().required().messages({
      'string.base': 'Team id must be a string',
    })
  }),
}

const removeUser = {
  params: Joi.object<DeleteUserFromTeamParams>().keys({
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

const updateTeamUserRole = {
  params: Joi.object<UpdateTeamUserRoleParams>().keys({
    teamId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Team id must be a string',
      'string.custom': 'Team id must be a valid cuid',
    }),
    userId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'User id must be a string',
      'string.custom': 'User id must be a valid cuid',
    })
  }),
  body: Joi.object<UpdateTeamUserRoleBody>().keys({
    roleId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Role id must be a string',
      'string.custom': 'Role id must be a valid cuid',
    }),
  }),
}

const userList = {
  params: Joi.object<TeamUserListParams>().keys({
    teamId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'Team id must be a string',
      'string.custom': 'Team id must be a valid cuid',
    }),
  }),
}

export const teamSchemas = {
  add,
  update,
  delete: deleteSchema,
  userSchemas: {
    updateRole: updateTeamUserRole,
    remove: removeUser,
    list: userList
  }
}
