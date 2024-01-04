import {param} from "express-validator"

export const deleteUserFromTeamValidator = [
  param("userId").exists().isString(),
  param("teamId").exists().isString()
]
