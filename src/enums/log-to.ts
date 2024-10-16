export enum LOG_TO_TENANT_IDS {
  ADMIN = "admin",
  DEFAULT = "default",
}

export enum LOG_TO_EVENTS {
  // User
  USER_CREATED = "User.Created",
  USER_DELETED = "User.Deleted",
  USER_DATA_UPDATED = "User.Data.Updated",
  USER_SUSPENSION_STATUS_UPDATED = "User.SuspensionStatus.Updated",
}

export enum LOG_TO_IDENTITIES {
  GOOGLE = "google",
  GITHUB = "github",
}
