export namespace PASSWORD {
  export const ENDPOINTS = {
    forgotPassword: "/forgot-password",
    setPassword: "/set-password",
    resetPassword: "/reset-password/:token",
  }

  export const MIN_LENGTH = 8
  export const REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[^\s\t]{PASSWORD_MIN_LENGTH,}$/
}
