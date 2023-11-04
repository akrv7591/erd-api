import {FindOptions} from "sequelize/types/model";
import {JWTPayload} from "jose";
interface IAuthorizedUser extends JWTPayload {
  id: string
  name: string
  email: string
  emailVerified: string
  createdAt: string
  updatedAt: string
}

declare global {
  namespace Express {
    export interface Request {
      authorizationUser?: IAuthorizedUser;
      pagination?: Pick<FindOptions, 'where' | 'limit' | 'offset' | 'order'>

      cookies: {
        jid?: string;
      };
    }
  }
}
