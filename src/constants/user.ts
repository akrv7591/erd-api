export namespace USER {
  export const ENDPOINTS = {
    fetchUserList: "/",
    fetchUserWithProfile: "/:userId",
    patchUserWithProfile: "/:userId",
    setPassword: "/set-password",
  }

  export enum API_ERRORS {
    NOT_FOUND="NOT_FOUND",
    BAD_REQUEST="BAD_REQUEST",
  }
}
