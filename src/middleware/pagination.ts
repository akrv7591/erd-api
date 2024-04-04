import {NextFunction, Request, Response} from "express";
import {Op, Order} from "sequelize";
import httpStatus from "http-status";
import {errorHandler} from "../utils/errorHandler";
import {COMMON} from "../constants/common";
import {HttpStatusCode} from "axios";
import {FindOptions} from "sequelize/types/model";

interface IPaginationOptions {
  searchFields?: string[],
  like?: boolean
}
export type PaginationRequestQuery = {
  q?: string
  limit?: string
  offset?: string
  order?: FindOptions['order']
}

export type PaginationRequest = Request<any, {}, {}, PaginationRequestQuery>

export const pagination = ({searchFields, like = true}: IPaginationOptions) =>
  async (
    req: PaginationRequest,
    res: Response,
    next: NextFunction
  ) => {
    const pagination: Request['pagination'] = {}

    let {
      q,
      limit = 10,
      offset = 0,
      order = ['createdAt', 'DESC'],
    } = req.query;

    // Check if the query string is valid and search fields exist
    if (q && searchFields && searchFields.length > 0) {
      if (!Array.isArray(searchFields)) {
        return errorHandler(req, res, HttpStatusCode.InternalServerError, COMMON.API_ERRORS.INTERNAL_SERVER_ERROR)
      }

      if (like !== undefined) {
        if (typeof like !== 'boolean') {
          return errorHandler(req, res, HttpStatusCode.InternalServerError, COMMON.API_ERRORS.INTERNAL_SERVER_ERROR)
        }
      }
      const query = like? `%${q}%`: q
      pagination.where = {
        [Op.or]:  searchFields.map(field => ({[field]: { [Op.like]: query}}))
      }
    }

    // Check if the order is valid
    if (order !== undefined) {
      if (!Array.isArray(order)) {
        return errorHandler(req, res, HttpStatusCode.InternalServerError, COMMON.API_ERRORS.INTERNAL_SERVER_ERROR)
      } else if (order.length > 0) {
        pagination.order = order as Order
      }
    }

    // Check if the limit and offset are valid
    limit = Number(Number(limit).toFixed())
    offset = Number(Number(offset).toFixed())


    if (isNaN(limit)) {
      return errorHandler(req, res, httpStatus.BAD_REQUEST, COMMON.API_ERRORS.LIMIT_IS_NOT_VALID)
    }

    if (isNaN(offset)) {
      return errorHandler(req, res, httpStatus.BAD_REQUEST, COMMON.API_ERRORS.OFFSET_IS_NOT_VALID)
    }

    pagination.limit = parseInt(String(limit))
    pagination.offset = parseInt(String(offset))

    req.pagination = pagination

    next()
  }
