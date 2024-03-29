import express from "express";
import validate from "../../../middleware/validate";
import {pagination} from "../../../middleware/pagination";
import {teamList} from "./teamList";
import {teamUpsert} from "./teamUpsert";
import {teamDelete} from "./teamDelete";
import {teamDetail} from "./teamDetail";
import {teamUserList} from "./teamUserList";
import {teamUserPermission} from "./teamUserPermission";
import {teamDeleteUser} from "./teamDeleteUser";
import {putTeamSchema, teamDeleteUserSchema, teamDetailOrDeleteSchema, teamIdSchema} from "../../../validations/team";
import {TEAM} from "../../../constants/team";


const teamRouter = express.Router()

teamRouter.get(
  TEAM.ENDPOINTS.teamUserList,
  validate(teamIdSchema),
  teamUserList
)
teamRouter.get(
  TEAM.ENDPOINTS.teamUserPermission,
  validate(teamIdSchema),
  teamUserPermission
)
teamRouter.delete(
  TEAM.ENDPOINTS.teamDeleteUser,
  validate(teamDeleteUserSchema),
  teamDeleteUser
)
teamRouter.delete(
  TEAM.ENDPOINTS.teamDelete,
  validate(teamDetailOrDeleteSchema),
  teamDelete
)
teamRouter.get(
  TEAM.ENDPOINTS.teamDetail,
  validate(teamDetailOrDeleteSchema),
  teamDetail
)
teamRouter.get(
  TEAM.ENDPOINTS.teamList,
  pagination({searchFields: ['name'], like: true}),
  teamList
)
teamRouter.put(
  TEAM.ENDPOINTS.teamUpsert,
  validate(putTeamSchema),
  teamUpsert
)

export default teamRouter
