import {NextFunction, Request, Response} from 'express';
import Joi from 'joi';
import validate from '../../src/middleware/validate';
import {HttpStatusCode} from 'axios';
import {errorHandler} from '../../src/utils/errorHandler';
import {COMMON} from "../../src/constants/common";

jest.mock("../../src/utils/errorHandler", () => ({
  errorHandler: jest.fn(),
}));

describe('validate middleware', () => {
  let req: Request, res: Response, next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {}
    } as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() if validation passes', () => {
    const schema: any = {}; // Define your schema here
    const validateMiddleware = validate(schema);

    const mockJoiObject = {
      validate: jest.fn().mockReturnValueOnce({error: null})
    };

    jest.spyOn(Joi, 'object').mockReturnValue(mockJoiObject as any);

    validateMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call errorHandler if validation fails', () => {
    const schema: any = {}; // Define your schema here
    const validateMiddleware = validate(schema);
    const validationError = {
      details: [{
        path: ['name.base'],
        message: 'Validation Error',
      }],
    } as unknown as Joi.ValidationError

    const mockJoiObject = {
      validate: jest.fn().mockReturnValueOnce({error: validationError})
    };

    jest.spyOn(Joi, 'object').mockReturnValue(mockJoiObject as any);

    validateMiddleware(req, res, next);

    expect(errorHandler).toHaveBeenCalledWith(
      req,
      res,
      HttpStatusCode.BadRequest,
      COMMON.API_ERRORS.BAD_REQUEST,
      [{field: 'name.base', message: 'Validation Error'}]
    );
  });
});
