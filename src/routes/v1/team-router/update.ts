import {axiosErrorHandler} from "../../../utils/errorHandler";
import {PostRequest} from "../../../types/types";
import {logToApi} from "../../../api/logTo";

export interface UpdateTeamBody {
  name: string
  description: string
}

export interface UpdateTeamParams {
  teamId: string
}

export const update: PostRequest<UpdateTeamParams, UpdateTeamBody> = async (req, res) => {
  const {teamId} = req.params
  const {name, description} = req.body
  const teamData = {
    name,
    description: description || "",
  }

  try {
    const team = await logToApi.patch(`/api/organizations/${teamId}`, teamData)
      .then(res => res.data)

    res.json(team)

  } catch (error) {
    axiosErrorHandler(res, error)
  }
}
