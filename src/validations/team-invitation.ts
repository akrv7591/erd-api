import Joi from "joi";
import {InviteUserBody} from "../routes/v1/team-invitation/inviteUser";
import {InvitationJoinParams} from "../routes/v1/team-invitation/invitationJoin";

const inviteUser = {
  body: Joi.object<InviteUserBody>().keys({
    invitee: Joi.string().required().email().messages({
      'string.base': 'invitee must be a string',
      'string.email': 'invitee must be a valid email',
    }),
    teamId: Joi.string().messages({
      'string.base': 'teamId must be a string',
    }),
    roleId: Joi.string().messages({
      'string.base': 'roleName must be a string',
    }),
    teamName: Joi.string().messages({
      'string.base': 'teamName must be a string',
    }),

  })
}

const invitationList = {
  query: Joi.object<InviteUserBody>().keys({
    teamId: Joi.string().messages({
      'string.base': 'teamId must be a string',
    }),
  })
}

const invitationJoin = {
  params: Joi.object<InvitationJoinParams>().keys({
    teamInvitationId: Joi.string().required().messages({
      'string.base': 'teamInvitationId must be a string',
    })
  })
}

export const teamInvitationSchemas = {
  inviteUser,
  invitationList,
  invitationJoin,
}
