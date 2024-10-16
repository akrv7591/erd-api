import {jwtVerify } from 'jose';
import {extractBearerTokenFromHeaders} from "../utils/tokenUtils";
import {RequestHandler} from "express";
import config from "../config/config";
import {Authorization} from "../types/express";

const {logTo, server} = config

export const logToAuth: RequestHandler = async (req, res, next) => {
  try {
    // Extract the token using the helper function defined above
    const token = extractBearerTokenFromHeaders(req.headers);

    const { payload } = await jwtVerify<Authorization>(
      // The raw Bearer Token extracted from the request header
      token,
      logTo.jwks,
      {
        // Expected issuer of the token, issued by the Logto server
        issuer: logTo.issuer,
        // Expected audience token, the resource indicator of the current API
        audience: server.url,
      }
    );

    req.authorization = payload

    // Sub is the user ID, used for user identification
    // const { scope, sub } = payload;

    // For role-based access control, we'll discuss it later
    // assert(scope.split(' ').includes('read:products'));

    return next();
  } catch (e: any) {
    switch (e.message) {
      case "Authorization header is missing":
        return res.sendStatus(401)

      case "Authorization header is not in the Bearer scheme":
        return res.sendStatus(401)

      default:
        return res.sendStatus(500)
    }

  }
};
