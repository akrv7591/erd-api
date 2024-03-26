export namespace User {
  export const endpoints = {
    fetchUserList: "/",
    fetchUserWithProfile: "/:userId",
    patchUserWithProfile: "/:userId",
    setPassword: "/set-password",
  }

  export enum ApiErrors {
    NOT_FOUND="NOT_FOUND",
  }
}
