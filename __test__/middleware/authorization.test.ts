import { Request, Response, NextFunction } from 'express';
import authorization from '../../src/middleware/authorization';
import { errorHandler } from '../../src/utils/errorHandler';
import { HttpStatusCode } from 'axios';
import { AUTH } from '../../src/constants/auth';
import { jwtVerify } from 'jose';
import {createId} from "@paralleldrive/cuid2";
import dayjs from "dayjs";

jest.mock('../../src/utils/errorHandler', () => ({
  errorHandler: jest.fn(),
}));

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

describe('authorization middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return unauthorized if no authorization header is provided', async () => {
    await authorization(req as Request, res as Response, next);
    expect(errorHandler).toHaveBeenCalledWith(req, res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return unauthorized if authorization header does not start with "Bearer "', async () => {
    req.headers = { authorization: 'InvalidToken' };
    await authorization(req as Request, res as Response, next);
    expect(errorHandler).toHaveBeenCalledWith(req, res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return unauthorized if token is missing', async () => {
    req.headers = { authorization: 'Bearer ' };
    await authorization(req as Request, res as Response, next);
    expect(errorHandler).toHaveBeenCalledWith(req, res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return Forbidden if token is expired', async () => {
    (jwtVerify as jest.Mock).mockRejectedValueOnce({ code: 'ERR_JWS_EXPIRED' });
    req.headers = { authorization: 'Bearer expiredToken' };
    await authorization(req as Request, res as Response, next);
    expect(errorHandler).toHaveBeenCalledWith(req, res, HttpStatusCode.Forbidden, AUTH.API_ERRORS.ACCESS_TOKEN_EXPIRED);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return unauthorized if jwtVerify throws an error', async () => {
    const errorMessage = 'JWT verification failed';
    (jwtVerify as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    req.headers = { authorization: 'Bearer invalidToken' };
    await authorization(req as Request, res as Response, next);
    expect(errorHandler).toHaveBeenCalledWith(req, res, HttpStatusCode.Unauthorized, AUTH.API_ERRORS.INVALID_ACCESS_TOKEN);
    expect(next).not.toHaveBeenCalled();
  });

  it('should set authorizationUser in request and call next if token is valid', async () => {
    const payload = {
      id: createId(),
      iat: dayjs().unix(),
      exp: dayjs().unix(),
    };

    (jwtVerify as jest.Mock).mockResolvedValueOnce({ payload });
    req.headers = { authorization: 'Bearer validToken' };
    await authorization(req as Request, res as Response, next);
    expect(req.authorizationUser).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(errorHandler).not.toHaveBeenCalled();
  });
});
