import express from "express";
import {teamInvitationSchemas} from "../../../validations/team-invitation";
import {inviteUser} from "./inviteUser";
import validate from "../../../middleware/validate";
import {TEAM_INVITATION} from "../../../constants/team-invitation";
import {invitationList} from "./invitationList";
import {invitationJoin} from "./invitationJoin";

const teamInvitationRouter = express.Router({mergeParams: true})

const {ENDPOINTS} = TEAM_INVITATION

teamInvitationRouter.post(
  ENDPOINTS.invitationJoin,
  validate(teamInvitationSchemas.invitationJoin),
  invitationJoin
)

teamInvitationRouter.post(
  ENDPOINTS.inviteUser,
  validate(teamInvitationSchemas.inviteUser),
  inviteUser
)

teamInvitationRouter.get(
  ENDPOINTS.invitationList,
  validate(teamInvitationSchemas.invitationList),
  invitationList
)


export default teamInvitationRouter
