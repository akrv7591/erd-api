import {LOG_TO_EVENTS, LOG_TO_IDENTITIES} from "../enums/log-to";

export interface User {
  id: string                       // Unique
  username: string | null          // Unique
  primaryEmail: string | null      // Unique
  primaryPhone: string | null      // Unique
  name: string | null
  avatar: string | null
  customData: CustomData
  identities: Identities
  profile: Profile
  lastSignInAt: number,
  createdAt: number,
  updatedAt: number,
  applicationId: string | null,
  isSuspended: boolean
}

export interface UserCreatedEvent {
  event: LOG_TO_EVENTS.USER_CREATED
  createdAt: string
  interactionEvent: string
  userAgent: string
  applicationId: string
  sessionId: string
  ip: string
  application: Application
  data: User
  hookId: string
}

export interface CustomData {
}

export interface Identities {
  [LOG_TO_IDENTITIES.GITHUB]: Identity<GithubRawData>
  [LOG_TO_IDENTITIES.GOOGLE]: Identity<GoogleRawData>
}

interface GoogleRawData extends Record<string, any> {}

interface GithubRawData extends Record<string, any> {}

interface Identity<T> {
  userId: string
  details: {
    avatar: string | null
    email: string | null
    id: string
    name: string | null
    rawData: T
  }
}

export interface Profile {}

export interface Application {
  id: string
  type: string
  name: string
  description: string
}

export interface Branding {
  logoUrl: string
  darkLogoUrl: string
  favicon: string
  darkFavicon: string
}

export interface CreateOrganizationResponse {
  tenantId: string
  id: string
  name: string
  description: string
  customData: Record<string, any>
  isMfaRequired: boolean
  branding: Branding
  createdAt: number
}


