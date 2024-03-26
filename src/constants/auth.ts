export namespace Auth {
  export const endpoints = {
    signIn: "/sign-in",
    signUp: "/signup",
    logout: "/logout",
    refresh: "/refresh",
    google: "/google"
  }

  export enum SocialLogins {
    GOOGLE = "GOOGLE"
  }

  export enum ApiErrors {
    EMAIL_AND_PASSWORD_REQUIRED="EMAIL_AND_PASSWORD_REQUIRED",
    USER_NOT_FOUND="USER_NOT_FOUND",
    INVALID_AUTHORIZATION="INVALID_AUTHORIZATION",
    NO_REFRESH_TOKEN_IN_COOKIES="NO_REFRESH_TOKEN_IN_COOKIES",
    REFRESH_TOKEN_INVALID="REFRESH_TOKEN_INVALID",
    GOOGLE_LOGIN_UNAUTHORIZED="GOOGLE_LOGIN_UNAUTHORIZED",
    INVALID_ACCESS_TOKEN="INVALID_ACCESS_TOKEN",
    ACCESS_TOKEN_EXPIRED="ACCESS_TOKEN_EXPIRED"
  }

  export function apiErrorText(error: ApiErrors): string {
    switch (error) {
      case ApiErrors.EMAIL_AND_PASSWORD_REQUIRED:
        return "Email and password are required"
      case ApiErrors.USER_NOT_FOUND:
        return "User not found"
      case ApiErrors.INVALID_AUTHORIZATION:
        return "Invalid authorization"
      case ApiErrors.NO_REFRESH_TOKEN_IN_COOKIES:
        return "No refresh token in cookies"
      case ApiErrors.REFRESH_TOKEN_INVALID:
        return "Refresh token invalid"
      case ApiErrors.GOOGLE_LOGIN_UNAUTHORIZED:
        return "Google login unauthorized"
      case ApiErrors.INVALID_ACCESS_TOKEN:
        return "Invalid access token"
      case ApiErrors.ACCESS_TOKEN_EXPIRED:
        return "Access token expired"
    }
  }
}
