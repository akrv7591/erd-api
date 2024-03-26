export namespace EmailVerification {
  export enum Type {
    EMAIL = 'email',
    TEAM_INVITATION = 'team-invitation'
  }

  export enum ApiError {
    NOT_FOUND="NOT_FOUND",
    EXPIRED="EXPIRED",
    INVALID="INVALID",
  }

  export function apiErrorText(error: ApiError): string {
    switch (error) {
      case ApiError.NOT_FOUND:
        return "Not found"
      case ApiError.EXPIRED:
        return "Expired"
      case ApiError.INVALID:
        return "Invalid"
    }
  }
}
