import {axiosErrorHandler} from "../../../utils/errorHandler";
import {PostRequest} from "../../../types/types";
import {logToApi} from "../../../api/logTo";

export interface DeleteTeamParams {
  teamId: string
}

export const remove: PostRequest<DeleteTeamParams> = async (req, res) => {
  const {teamId} = req.params

  try {
    const team = await logToApi.delete(`/api/organizations/${teamId}`)
      .then(res => res.data)

    res.json(team)

  } catch (error) {
    axiosErrorHandler(res, error)
  }
}
