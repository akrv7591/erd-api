export namespace Auth {
  export enum SocialLogin {
    GOOGLE = "GOOGLE"
  }

  export enum ApiError {
    EMAIL_AND_PASSWORD_REQUIRED="EMAIL_AND_PASSWORD_REQUIRED",
    USER_NOT_FOUND="USER_NOT_FOUND",
    INVALID_AUTHORIZATION="INVALID_AUTHORIZATION",
    NO_REFRESH_TOKEN_IN_COOKIES="NO_REFRESH_TOKEN_IN_COOKIES",
    REFRESH_TOKEN_INVALID="REFRESH_TOKEN_INVALID",
    GOOGLE_LOGIN_UNAUTHORIZED="GOOGLE_LOGIN_UNAUTHORIZED",
    INVALID_ACCESS_TOKEN="INVALID_ACCESS_TOKEN",
    ACCESS_TOKEN_EXPIRED="ACCESS_TOKEN_EXPIRED"
  }

  export function apiErrorText(error: ApiError): string {
    switch (error) {
      case ApiError.EMAIL_AND_PASSWORD_REQUIRED:
        return "Email and password are required"
      case ApiError.USER_NOT_FOUND:
        return "User not found"
      case ApiError.INVALID_AUTHORIZATION:
        return "Invalid authorization"
      case ApiError.NO_REFRESH_TOKEN_IN_COOKIES:
        return "No refresh token in cookies"
      case ApiError.REFRESH_TOKEN_INVALID:
        return "Refresh token invalid"
      case ApiError.GOOGLE_LOGIN_UNAUTHORIZED:
        return "Google login unauthorized"
      case ApiError.INVALID_ACCESS_TOKEN:
        return "Invalid access token"
      case ApiError.ACCESS_TOKEN_EXPIRED:
        return "Access token expired"
    }
  }
}
