import {FindOptions} from "sequelize/types/model";
import {JWTPayload} from "jose";
interface IAuthorizedUser extends JWTPayload {
  id: string
}

declare global {
  namespace Express {
    export interface Request {
      authorizationUser?: IAuthorizedUser;
      pagination?: Pick<FindOptions, 'where' | 'limit' | 'offset' | 'order'>
      file: Express.MulterMinIOStorage.File | any
      files: Express.MulterMinIOStorage.File[]

      cookies: {
        jid?: string;
      };
    }
  }
}
