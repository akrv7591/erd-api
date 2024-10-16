import type {NextFunction, Request, RequestHandler, Response} from 'express';
import type { DeepPartial } from 'utility-types';
import type { IFilterXSSOptions } from 'xss';
import {FindOptions} from "sequelize/types/model";
import {ObjectSchema} from "joi";

// See this for the following types
// https://stackoverflow.com/questions/34508081/how-to-add-typescript-definitions-to-express-req-res
// https://stackoverflow.com/questions/61132262/typescript-deep-partial

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

// More strictly typed Express.Request type
export type TypedRequest<
  ReqBody = Record<string, unknown>,
  QueryString = Record<string, unknown>
> = Request<
  Record<string, unknown>,
  Record<string, unknown>,
  DeepPartial<ReqBody>,
  DeepPartial<QueryString>
>;

// More strictly typed express middleware type
export type ExpressMiddleware<
  ReqBody = Record<string, unknown>,
  Res = Record<string, unknown>,
  QueryString = Record<string, unknown>
> = (
  req: TypedRequest<ReqBody, QueryString>,
  res: Response<Res>,
  next: NextFunction
) => Promise<void> | void;

export type PaginationRequestQuery<T = {}> = {
  q?: string
  limit?: string
  offset?: string
  order?: FindOptions['order']
} & T

interface PaginationOptions {
  searchFields?: string[],
  like?: boolean
}

export type ListResponse = {
  count: number,
  rows: any[]
}

// CRUD requests

export type ListRequest<Params = {}, Response = {}, Query = {}> = RequestHandler<Params, Response, {}, PaginationRequestQuery<Query>>
export type PostRequest<Params = {}, Body = {}> = RequestHandler<Params, {}, Body>
export type GetRequest<Params = {}> = RequestHandler<Params>
export type PutRequest<Params = {}, Body = {}> = RequestHandler<Params, {}, Body>
export type PatchRequest<Params = {}, Body = {}> = RequestHandler<Params, {}, Body>
export type DeleteRequest<Params = {}, Body = {}> = RequestHandler<Params, Body>

export type Pagination = (options: PaginationOptions) => ListRequest

export type Requests = ListRequest & PostRequest & GetRequest & PutRequest & PatchRequest & DeleteRequest

// Validation types
export type RequestValidationSchema = RequireAtLeastOne<
  Record<'body' | 'query' | 'params', ObjectSchema>
>;

export type Validate = (schema: RequestValidationSchema) => Requests


// Example usage from Stackoverflow:
// type Req = { email: string; password-router: string };

// type Res = { message: string };

// export const signupUser: ExpressMiddleware<Req, Res> = async (req, res) => {
//   /* strongly typed `req.body`. yay autocomplete 🎉 */
//   res.json({ message: 'you have signed up' }) // strongly typed response obj
// };


export type Sanitized<T> = T extends (...args: unknown[]) => unknown
  ? T // if T is a function, return it as is
  : T extends object
  ? {
      readonly [K in keyof T]: Sanitized<T[K]>;
    }
  : T;

export type SanitizeOptions = IFilterXSSOptions & {
  whiteList?: IFilterXSSOptions['whiteList'];
};
