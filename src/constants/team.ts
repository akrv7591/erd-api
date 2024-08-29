export namespace TEAM {
  export const ENDPOINTS = {
    teamUserDetail: "/:teamId/user/:userId",
    inviteUser: "/:teamId/user-invite",
    userList: "/:teamId/user",
    userPermission: "/:teamId/user-permission",
    deleteUser: "/:teamId/delete-user/:userId",
    delete: "/:teamId",
    detail: "/:teamId",
    list: "",
    upsert: "",
  }

  export enum API_ERRORS {
    NOT_FOUND="NOT_FOUND",
    INVITATION_EMAIL_SEND_FAIL="INVITATION_EMAIL_SEND_FAIL"
  }

  export function apiErrorText(error: API_ERRORS): string {
    switch (error) {
      case API_ERRORS.NOT_FOUND:
        return "Team is not found"
      case API_ERRORS.INVITATION_EMAIL_SEND_FAIL:
        return "Team invitation email failed"
    }
  }
}
