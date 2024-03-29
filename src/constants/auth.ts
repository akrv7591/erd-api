export namespace AUTH {
  export const ENDPOINTS = {
    signIn: "/sign-in",
    signUp: "/signup",
    logout: "/logout",
    refresh: "/refresh",
    google: "/google"
  }

  export enum SOCIAL_LOGIN {
    GOOGLE = "GOOGLE"
  }

  export enum API_ERRORS {
    EMAIL_AND_PASSWORD_REQUIRED="EMAIL_AND_PASSWORD_REQUIRED",
    USER_NOT_FOUND="USER_NOT_FOUND",
    INVALID_AUTHORIZATION="INVALID_AUTHORIZATION",
    NO_REFRESH_TOKEN_IN_COOKIES="NO_REFRESH_TOKEN_IN_COOKIES",
    REFRESH_TOKEN_INVALID="REFRESH_TOKEN_INVALID",
    GOOGLE_LOGIN_UNAUTHORIZED="GOOGLE_LOGIN_UNAUTHORIZED",
    INVALID_ACCESS_TOKEN="INVALID_ACCESS_TOKEN",
    ACCESS_TOKEN_EXPIRED="ACCESS_TOKEN_EXPIRED"
  }

  export function apiErrorText(error: API_ERRORS): string {
    switch (error) {
      case API_ERRORS.EMAIL_AND_PASSWORD_REQUIRED:
        return "Email and password are required"
      case API_ERRORS.USER_NOT_FOUND:
        return "User not found"
      case API_ERRORS.INVALID_AUTHORIZATION:
        return "Invalid authorization"
      case API_ERRORS.NO_REFRESH_TOKEN_IN_COOKIES:
        return "No refresh token in cookies"
      case API_ERRORS.REFRESH_TOKEN_INVALID:
        return "Refresh token invalid"
      case API_ERRORS.GOOGLE_LOGIN_UNAUTHORIZED:
        return "Google login unauthorized"
      case API_ERRORS.INVALID_ACCESS_TOKEN:
        return "Invalid access token"
      case API_ERRORS.ACCESS_TOKEN_EXPIRED:
        return "Access token expired"
    }
  }
}
