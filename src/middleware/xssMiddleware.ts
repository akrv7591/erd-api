import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';
import { sanitize } from '../utils/sanitize.util';
import type { ExpressMiddleware, SanitizeOptions } from '../types/types';

export const xssMiddleware = (options?: SanitizeOptions): ExpressMiddleware => {
  // This middleware sanitizes incoming request data to prevent XSS attacks
  return (req, _res, next) => {
    req.body = sanitize(req.body, options);
    req.query = sanitize(req.query, options) as unknown as ParsedQs;
    req.params = sanitize(req.params, options) as unknown as ParamsDictionary;

    next();
  };
};
