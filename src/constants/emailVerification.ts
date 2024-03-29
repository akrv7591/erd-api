export namespace EMAIL_VERIFICATION {
  export const ENDPOINTS = {
    sendVerificationEmail: "/send-verification-email",
    verifyEmail: "/verify-email/:token",
    verifyJoinTeamEmail: "/verify-join-team-email/:token"
  }

  export enum TYPES {
    EMAIL = 'email',
    TEAM_INVITATION = 'team-invitation'
  }

  export enum API_ERRORS {
    NOT_FOUND="NOT_FOUND",
    EXPIRED="EXPIRED",
    INVALID="INVALID",
  }

  export function apiErrorText(error: API_ERRORS): string {
    switch (error) {
      case API_ERRORS.NOT_FOUND:
        return "Not found"
      case API_ERRORS.EXPIRED:
        return "Expired"
      case API_ERRORS.INVALID:
        return "Invalid"
    }
  }
}
