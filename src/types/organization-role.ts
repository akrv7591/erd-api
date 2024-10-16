export interface OrganizationRole {
  tenantId: string
  id: string
  name: string
  description: string
  type: string
  scopes: Scope[]
  resourceScopes: ResourceScope[]
}

export interface Scope {
  id: string
  name: string
}

export interface ResourceScope {
  id: string
  name: string
  resource: Resource
}

export interface Resource {
  id: string
  name: string
}
