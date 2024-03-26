export namespace EmailVerification {
  export const endpoints = {
    sendVerificationEmail: "/send-verification-email",
    verifyEmail: "/verify-email/:token",
    verifyJoinTeamEmail: "/verify-join-team-email/:token"
  }

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
