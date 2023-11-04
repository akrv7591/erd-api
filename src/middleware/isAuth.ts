import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

import {jwtVerify, errors} from "jose";
import config from '../config/config';
import {IAuthorizedUser} from "../types/express";

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  // token looks like 'Bearer vnjaknvijdaknvikbnvreiudfnvriengviewjkdsbnvierj'

  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }

  const token: string | undefined = authHeader.split(' ')[1];

  if (!token) return res.sendStatus(httpStatus.UNAUTHORIZED);

  try {
    const {payload} = await jwtVerify<IAuthorizedUser>(token, config.jwt.access_token.secret)
    req.authorizationUser = payload;

    next()
  } catch(err) {


    if (err instanceof errors.JWTExpired) {
      return res.status(httpStatus.FORBIDDEN).json({
        message: err.code
      });

    }

    return res.sendStatus(httpStatus.FORBIDDEN); // invalid token
  }

};

export default isAuth;
