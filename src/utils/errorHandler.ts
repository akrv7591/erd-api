import type {Response} from 'express';
import logger from './logger';
import {HttpStatusCode} from "axios";
import {ResponseErrorCodes} from "../types/response";

export const internalErrorHandler = (
  res: Response,
  err: Error | any,
): void => {
  logger.warn(err);
  res.sendStatus(HttpStatusCode.InternalServerError);
};


export const errorHandler = (
  res: Response,
  statusCode: HttpStatusCode,
  errorCode: ResponseErrorCodes,
  errors?: { field: string, message: string }[]
): void => {
  res.status(statusCode).json({code: errorCode, errors})
}
