interface CustomData {}

interface Identities {
  additionalProperty1: AdditionalProperty1
  additionalProperty2: AdditionalProperty2
}

interface AdditionalProperty1 {
  userId: string
  details: Details
}

interface Details {}

interface AdditionalProperty2 {
  userId: string
  details: Details2
}

interface Details2 {}

interface Profile {
  familyName: string
  givenName: string
  middleName: string
  nickname: string
  preferredUsername: string
  profile: string
  website: string
  gender: string
  birthdate: string
  zoneinfo: string
  locale: string
  address: Address
}

interface Address {
  formatted: string
  streetAddress: string
  locality: string
  region: string
  postalCode: string
  country: string
}

interface SsoIdentity {
  tenantId: string
  id: string
  userId: string
  issuer: string
  identityId: string
  detail: Detail
  createdAt: number
  ssoConnectorId: string
}

interface Detail {}

export interface GetUserResponse {
  id: string
  username: string
  primaryEmail: string
  primaryPhone: string
  name: string
  avatar: string
  customData: CustomData
  identities: Identities
  lastSignInAt: number
  createdAt: number
  updatedAt: number
  profile: Profile
  applicationId: string
  isSuspended: boolean
  hasPassword: boolean
  ssoIdentities: SsoIdentity[]
}
