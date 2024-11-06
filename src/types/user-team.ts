export interface CustomData {
  owner: string
  isPersonal: boolean
}

export interface Branding {
  logoUrl: string
  darkLogoUrl: string
  favicon: string
  darkFavicon: string
}

export interface OrganizationRole {
  id: string
  name: string
}

export interface UserTeam {
  tenantId: string
  id: string
  name: string
  description: string
  customData: CustomData
  isMfaRequired: boolean
  branding: Branding
  createdAt: number
  organizationRoles: OrganizationRole[]
}
