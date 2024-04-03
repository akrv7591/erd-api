import {Request, Response, NextFunction} from "express";
import {Op, Order} from "sequelize";
import httpStatus from "http-status";
import {errorHandler} from "../utils/errorHandler";
import {COMMON} from "../constants/common";
interface IPaginationOptions {
  searchFields?: string[],
  like?: boolean
}

export const pagination = ({searchFields, like}: IPaginationOptions) =>
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const pagination: Request['pagination'] = {}

    let {
      q,
      limit = 10,
      offset = 0,
      order = ["createdAt", 'desc'],
    } = req.query;

    // Check if the query string is valid and search fields exist
    if (q && searchFields && searchFields.length > 0) {
      const query = like? `%${q}%`: q
      pagination.where = {
        [Op.or]:  searchFields.map(field => ({[field]: { [Op.like]: query}}))
      }
    }

    // Check if the order is valid
    if (Array.isArray(order) && order.length > 0) {
      pagination.order = order as Order
    }

    // Check if the limit and offset are valid
    limit = parseInt(String(limit))
    offset = parseInt(String(offset))

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
