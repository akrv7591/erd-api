import {TEAM_INVITATION} from "../constants/team-invitation";

export interface TeamInvitationResponse {
  tenantId: string
  id: string
  inviterId: string
  invitee: string
  acceptedUserId: string
  organizationId: string
  status: TEAM_INVITATION.STATUS
  createdAt: number
  updatedAt: number
  expiresAt: number
  organizationRoles: OrganizationRole[]
}

export interface OrganizationRole {
  id: string
  name: string
}
