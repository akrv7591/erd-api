import type {NextFunction, Request, Response} from 'express';
import {errors, jwtVerify} from "jose";
import config from '../config/config';
import {IAuthorizedUser} from "../types/express";
import {errorHandler} from "./internalErrorHandler";
import {HttpStatusCode} from "axios";
import {AUTH} from "../constants/auth";

const authorization = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return errorHandler(req, res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN)
  }

  const token: string | undefined = authHeader.split(' ')[1];

  if (!token) {
    return errorHandler(req, res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN)
  }

  try {
    const {payload} = await jwtVerify<IAuthorizedUser>(token, config.jwt.access_token.secret)
    req.authorizationUser = payload;

    next()
  } catch (err) {

    if (err instanceof errors.JWTExpired) {
      return errorHandler(req, res, HttpStatusCode.Forbidden, AUTH.API_ERRORS.ACCESS_TOKEN_EXPIRED)
    }

    errorHandler(req, res, HttpStatusCode.Forbidden, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN)
  }

};

export default authorization;
