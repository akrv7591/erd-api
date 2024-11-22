import {jwtVerify } from 'jose';
import {extractBearerTokenFromHeaders} from "../utils/tokenUtils";
import {RequestHandler} from "express";
import config from "../config/config";
import {Authorization} from "../types/express";
import {internalErrorHandler} from "../utils/errorHandler";

const {logTo, server} = config;

export const logToAuth: RequestHandler = async (req, res, next) => {
  try {
    // Extract Bearer token from request headers
    const token = extractBearerTokenFromHeaders(req.headers);

    // Verify JWT token with jwks URL and issuer/audience claims
    const { payload } = await jwtVerify<Authorization>(
      token,
      logTo.jwks,
      {
        issuer: logTo.issuer,
        audience: server.url,
      }
    );

    // Set authorization data on request object
    req.authorization = payload;

    return next();
  } catch (e: any) {
    // Handle specific error cases for missing/invalid headers
    switch (e.message) {
      case "Authorization header is missing":
        console.error(e.message)
        return res.sendStatus(401);

      case "Authorization header is not in the Bearer scheme":
        console.error(e.message)
        return res.sendStatus(401);

      default:
        // Catch-all for unexpected errors and re-throw with error handler
        return internalErrorHandler(res, e);
    }
  }
};
