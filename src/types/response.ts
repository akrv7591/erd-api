import {AUTH} from "../constants/auth";
import {EMAIL_VERIFICATION} from "../constants/emailVerification";
import {USER} from "../constants/user";
import {COMMON} from "../constants/common";
import {TEAM} from "../constants/team";



export type ResponseErrorCodes = COMMON.API_ERRORS
  | AUTH.API_ERRORS
  | EMAIL_VERIFICATION.API_ERRORS
  | USER.API_ERRORS
  | TEAM.API_ERRORS
