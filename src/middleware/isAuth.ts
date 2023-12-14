import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import {jwtVerify, errors} from "jose";
import config from '../config/config';
import {IAuthorizedUser} from "../types/express";
import {AUTH} from "../enums/auth";

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.status(httpStatus.UNAUTHORIZED).json({code: AUTH.INVALID_ACCESS_TOKEN});
  }

  const token: string | undefined = authHeader.split(' ')[1];

  if (!token) return res.status(httpStatus.UNAUTHORIZED).json({code: AUTH.INVALID_ACCESS_TOKEN});

  try {
    const {payload} = await jwtVerify<IAuthorizedUser>(token, config.jwt.access_token.secret)
    req.authorizationUser = payload;

    next()
  } catch(err) {

    if (err instanceof errors.JWTExpired) {
      return res.status(httpStatus.FORBIDDEN).json({ code: AUTH.ACCESS_TOKEN_EXPIRED});
    }

    return res.status(httpStatus.FORBIDDEN).json({code: AUTH.INVALID_ACCESS_TOKEN}); // invalid token
  }

};


export default isAuth;
