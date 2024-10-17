import type {Response} from 'express';
import logger from './logger';
import axios, {HttpStatusCode} from "axios";
import {ResponseErrorCodes} from "../types/response";

export const internalErrorHandler = (
  res: Response,
  err: Error | any,
): void => {
  logger.error(err);
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

export const axiosErrorHandler = (res: Response, error: any): void => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status) {
      res.sendStatus(error.response.status)
    } else {
      internalErrorHandler(res, error)
    }
  } else {
    internalErrorHandler(res, error)
  }
}
