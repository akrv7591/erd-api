import {FindOptions} from "sequelize/types/model";
import {JWTPayload} from "jose";

export interface AuthorizedUser extends JWTPayload {
  id: string
}

declare global {
  namespace Express {
    export interface Request {
      authorizationUser?: AuthorizedUser;
      pagination?: Pick<FindOptions, 'where' | 'limit' | 'offset' | 'order'>
      cookies: {
        jid?: string;
      };
    }
  }
}
