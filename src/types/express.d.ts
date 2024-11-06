import {FindOptions} from "sequelize/types/model";
import {JWTPayload} from "jose";

export interface Authorization extends JWTPayload {
  scope: string
  client_id: string
  iss: string
  aud: string
  sub: string
}

declare global {
  namespace Express {
    export interface Request {
      authorization: Authorization;
      pagination?: Pick<FindOptions, 'where' | 'limit' | 'offset' | 'order'>
      cookies: {
        jid?: string;
      };
    }
  }
}
