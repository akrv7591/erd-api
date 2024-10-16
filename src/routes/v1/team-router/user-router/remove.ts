import {axiosErrorHandler} from "../../../../utils/errorHandler";
import {PostRequest} from "../../../../types/types";
import {logToApi} from "../../../../api/logTo";

export interface DeleteUserFromTeamParams {
  teamId: string
  userId: string
}

export const remove: PostRequest<DeleteUserFromTeamParams> = async (req, res) => {
  const {teamId, userId} = req.params

  try {
    const team = await logToApi.delete(`/api/organizations/${teamId}/users/${userId}`)
      .then(res => res.data)

    res.json(team)
  } catch (error) {
    axiosErrorHandler(res, error)
  }
}
