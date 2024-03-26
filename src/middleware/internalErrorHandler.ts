import type { Request, Response } from 'express';
import logger from './logger';
import {HttpStatusCode} from "axios";
import {ResponseErrorCodes} from "../types/response";
import {TypedRequest} from "../types/types";

export const internalErrorHandler = (
  err: Error | any,
  _req: Request<any> | TypedRequest,
  res: Response
): void => {
  logger.error(err);

  res.status(500).json({ message: err.message });
};



export const errorHandler = (
  req: Request<any> | TypedRequest,
  res: Response,
  statusCode: HttpStatusCode,
  errorCode: ResponseErrorCodes
): void => {
  res.status(statusCode).json({code: errorCode})
}
