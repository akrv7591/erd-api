import {errorHandler, internalErrorHandler} from "../../../../utils/errorHandler";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../../../constants/common";
import {ListRequest} from "../../../../types/types";
import {logToApi} from "../../../../api/logTo";

export type TeamUserListParams = {
  teamId: string
}

export type TeamUserListQuery = {
}

export const list: ListRequest<TeamUserListParams, TeamUserListQuery> = async (req, res) => {
  try {
    const {teamId} = req.params
    const data = await logToApi.get(`/api/organizations/${teamId}/users`)
      .then(res => res.data)

    if (!data) {
      return errorHandler(res, HttpStatusCode.NotFound, COMMON.API_ERRORS.NOT_FOUND)
    }

    res.json(data)

  } catch (e) {
    internalErrorHandler(res, e)
  }
}
