import express from "express";
import {pagination} from "../../../middleware/pagination";
import {list} from "./list";
import {upsert} from "./upsert";
import {validateSchemas} from "../../../middleware/validateSchemas";
import {teamSchema} from "../../../validations/team.validation";
import {deleteTeam} from "./deleteTeam";
import TeamController from "../../../controllers/TeamController"
import {teamDetail} from "./teamDetail";
import {deleteUserFromTeamValidator} from "../../../validations/deleteUserFromTeam.validator";

const teamRouter = express.Router()

teamRouter.get("/:teamId/user-list", TeamController.userList)
teamRouter.get("/:teamId/user-permission", TeamController.userPermission)
teamRouter.delete("/:teamId/delete-user/:userId", validateSchemas(deleteUserFromTeamValidator), TeamController.deleteUserFromTeam)
teamRouter.get("/:teamId/user-team", teamDetail)
teamRouter.delete("/:teamId", deleteTeam)
teamRouter.get("/:teamId", teamDetail)
teamRouter.get("", pagination({searchFields: ['name'], like: true}), list)
teamRouter.put("", validateSchemas(teamSchema), upsert)

export default teamRouter
