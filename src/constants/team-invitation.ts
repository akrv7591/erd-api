export namespace TEAM_INVITATION {
  export const ENDPOINTS = {
    invitationList: "/",
    inviteUser: "/",
    invitationJoin: "/:teamInvitationId/join",
  }

  export enum STATUS {
    PENDING = "Pending",
    ACCEPTED = "Accepted",
    EXPIRED = "Expired",
    REVOKED = "Revoked",

  }

  export enum API_ERRORS {
  }

  export function apiErrorText(error: API_ERRORS): string {
    return ""
  }
}
