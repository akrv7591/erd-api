export namespace EmailVerification {
  export enum Types {
    EMAIL = 'email',
    TEAM_INVITATION = 'team-invitation'
  }

  export enum ApiErrors {
    NOT_FOUND="NOT_FOUND",
    EXPIRED="EXPIRED",
    INVALID="INVALID",
  }

  export function apiErrorText(error: ApiErrors): string {
    switch (error) {
      case ApiErrors.NOT_FOUND:
        return "Not found"
      case ApiErrors.EXPIRED:
        return "Expired"
      case ApiErrors.INVALID:
        return "Invalid"
    }
  }
}
