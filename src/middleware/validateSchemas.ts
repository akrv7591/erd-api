import {ValidationChain, validationResult} from "express-validator"
import express from "express";
import httpStatus from "http-status";

export const validateSchemas = (validations: ValidationChain[]) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  for (let validation of validations) {
    const result = await validation.run(req);
    if (result.array().length) break;
  }

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
}
