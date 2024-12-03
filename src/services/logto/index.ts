import config from "../../config/config";
import {logToApi} from "../../api/logTo";
import {OrganizationRole} from "../../types/organization-role";
import {CreateOrganizationResponse, UserCreatedEvent} from "../../types/log-to";
import {LOG_TO_TENANT_IDS} from "../../enums/log-to";

interface AccessTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
}

export class LogToService {
  static authentication: AccessTokenResponse
  static authorization: string
  static roles: OrganizationRole[]

  static init = async () => {
    LogToService.authentication = await LogToService.fetchAccessToken()
    LogToService.authorization = `${LogToService.authentication.token_type} ${LogToService.authentication.access_token}`
    LogToService.roles = await LogToService.fetchRoles()
  }

  static fetchAccessToken = async (): Promise<AccessTokenResponse> => {
    const {appId, appSecret} = config.logTo;

    const data = {
      grant_type: "client_credentials",
      resource: "https://default.logto.app/api",
      scope: "all"
    }

    const authentication = await logToApi.post<AccessTokenResponse>("/oidc/token", data, {
      headers: {
        "Authorization": `Basic ${Buffer.from(`${appId}:${appSecret}`).toString("base64")}`
      },
    })
      .then((res) => {
        console.log(res.data)
        return res.data
      })

    // Update access token 10 minutes before it expires
    setTimeout(this.init, (authentication.expires_in - 600) * 1000)

    return authentication
  }


  static async fetchRoles() {
    const roles = await logToApi.get<OrganizationRole[]>(`/api/organization-roles`)
      .then(res => res.data)
    return roles
  }

  static async createUserOrganization(userCreateEvent: UserCreatedEvent) {
    const userId = userCreateEvent.data.id
    const organization = await logToApi.post<CreateOrganizationResponse>("/api/organizations", {
      tenantId: LOG_TO_TENANT_IDS.DEFAULT,
      name: "Personal",
      description: "Your personal team",
      isMfaRequired: false,
      customData: {
        isPersonal: true,
        owner: userId
      },
      createdAt: new Date().getTime()
    })
      .then(res => res.data)
      .catch(e => {
        console.log(e)
        throw e
      })

    await LogToService.assignUserToOrganization(userId, organization.id)
    await LogToService.assignUserToOrganizationRole(userId, organization.id)

    return organization
  }

  static async assignUserToOrganization(userId: string, organizationId: string) {
    await logToApi.post(`/api/organizations/${organizationId}/users`, {
      userIds: [userId]
    })
  }

  static async assignUserToOrganizationRole(userId: string, organizationId: string) {
    const ownerRole = LogToService.roles.find(role => role.name === "owner")!

    await logToApi.post(`/api/organizations/${organizationId}/users/roles`, {
      userIds: [userId],
      organizationRoleIds: [ownerRole.id]
    })

  }

}
