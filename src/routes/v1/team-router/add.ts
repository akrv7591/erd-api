import {axiosErrorHandler} from "../../../utils/errorHandler";
import {PostRequest} from "../../../types/types";
import {logToApi} from "../../../api/logTo";
import {LogToService} from "../../../services/logto";
import {LOG_TO_TENANT_IDS} from "../../../enums/log-to";

export interface AddTeamBody {
  name: string
  description: string
}

export const add: PostRequest<{}, AddTeamBody> = async (req, res) => {
  const {name, description} = req.body
  const {sub: userId} = req.authorization

  const teamData = {
    tenantId: LOG_TO_TENANT_IDS.DEFAULT,
    name,
    description,
    customData: {
      isPersonal: false,
      owner: userId
    },
    isMfaRequired: false,
    createdAt: new Date().getTime()
  }

  try {
    const team = await logToApi.post(`/api/organizations`, teamData)
      .then(res => res.data)

    await LogToService.assignUserToOrganization(userId, team.id)
    await LogToService.assignUserToOrganizationRole(userId, team.id)
    const ownerRole = LogToService.roles.find(role => role.name === "owner")!

    res.json({
      ...team,
      organizationRoles: [{
        id: ownerRole?.id,
        name: ownerRole?.name
      }]
    })

  } catch (error) {
    axiosErrorHandler(res, error)
  }
}
