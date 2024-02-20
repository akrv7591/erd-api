export enum AUTH {

  // 400
  EMAIL_AND_PASSWORD_REQUIRED=400,

  // 401
  USER_NOT_FOUND,
  INVALID_AUTHORIZATION,
  NO_REFRESH_TOKEN_IN_COOKIES,
  REFRESH_TOKEN_INVALID,
  GOOGLE_LOGIN_UNAUTHORIZED,
  INVALID_ACCESS_TOKEN,
  ACCESS_TOKEN_EXPIRED
}