import type {NextFunction, Request, Response} from 'express';
import {errors, jwtVerify} from "jose";
import config from '../config/config';
import {AuthorizedUser} from "../types/express";
import {errorHandler} from "../utils/errorHandler";
import {HttpStatusCode} from "axios";
import {AUTH} from "../constants/auth";

const authorization = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers?.authorization;

  // Handle no authorization header
  if (!authHeader) {
    return errorHandler(res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN)
  }

  // Handle invalid authorization header
  if (!authHeader.startsWith('Bearer ')) {
    return errorHandler(res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN)
  }

  const token: string | undefined = authHeader.split(' ')[1];

  // Handle no token
  if (!token) {
    return errorHandler(res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN)
  }

  // Verify token
  try {
    const {payload} = await jwtVerify<AuthorizedUser>(token, config.jwt.access_token.secret)
    req.authorizationUser = payload;

    next()
  } catch (err) {
    const {code} = err as errors.JOSEError

    switch (code) {
      case "ERR_JWS_INVALID":
        return errorHandler(res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN)
      case "ERR_JWS_EXPIRED":
        return errorHandler(res, HttpStatusCode.Forbidden, AUTH.API_ERRORS.ACCESS_TOKEN_EXPIRED)
      default:
        return errorHandler(res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN)
    }
  }
};

export default authorization;
