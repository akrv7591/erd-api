import {axiosErrorHandler} from "../../../../utils/errorHandler";
import {PutRequest} from "../../../../types/types";
import {logToApi} from "../../../../api/logTo";

export interface UpdateTeamUserRoleParams {
  teamId: string
  userId: string
}

export interface UpdateTeamUserRoleBody {
  roleId: string
}

export const updateRole: PutRequest<UpdateTeamUserRoleParams, UpdateTeamUserRoleBody> = async (req, res) => {
  const {teamId, userId} = req.params
  const {roleId} = req.body

  try {
    const roles = await logToApi.put(`/api/organizations/${teamId}/users/${userId}/roles`, {
      organizationRoleIds: [roleId]
    })
      .then(res => res.data)

    res.json(roles)
  } catch (error) {
    axiosErrorHandler(res, error)
  }
}
