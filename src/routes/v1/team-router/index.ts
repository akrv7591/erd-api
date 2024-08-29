import express from "express";
import validate from "../../../middleware/validate";
import {pagination} from "../../../middleware/pagination";
import {teamList} from "./teamList";
import {teamUpsert} from "./teamUpsert";
import {teamDelete} from "./teamDelete";
import {teamDetail} from "./teamDetail";
import {teamUserList} from "./teamUserList";
import {teamDeleteUser} from "./teamDeleteUser";
import {teamSchemas} from "../../../validations/team";
import {TEAM} from "../../../constants/team";
import {teamInviteUser} from "./teamInviteUser";
import {teamUserDetail} from "./teamUserDetail";

const teamRouter = express.Router({mergeParams: true})

teamRouter.get(
  TEAM.ENDPOINTS.teamUserDetail,
  validate(teamSchemas.userTeamDetail),
  teamUserDetail
)

teamRouter.post(
  TEAM.ENDPOINTS.inviteUser,
  validate(teamSchemas.inviteUser),
  teamInviteUser
)
teamRouter.get(
  TEAM.ENDPOINTS.userList,
  validate(teamSchemas.teamId),
  teamUserList
)

teamRouter.delete(
  TEAM.ENDPOINTS.deleteUser,
  validate(teamSchemas.userDelete),
  teamDeleteUser
)

teamRouter.get(
  TEAM.ENDPOINTS.detail,
  validate(teamSchemas.teamId),
  teamDetail
)
teamRouter.delete(
  TEAM.ENDPOINTS.delete,
  validate(teamSchemas.teamId),
  teamDelete
)
teamRouter.get(
  TEAM.ENDPOINTS.list,
  pagination({searchFields: ['name'], like: true}),
  teamList
)
teamRouter.put(
  TEAM.ENDPOINTS.upsert,
  validate(teamSchemas.put),
  teamUpsert
)

export default teamRouter
