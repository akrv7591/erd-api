import {Request} from "express";
import {Op, Order} from "sequelize";
import httpStatus from "http-status";
import {errorHandler} from "../utils/errorHandler";
import {COMMON} from "../constants/common";
import {HttpStatusCode} from "axios";
import {Pagination} from "../types/types";

export const pagination: Pagination = ({searchFields, like = true}) => async (req, res, next) => {
  const pagination: Request['pagination'] = {}

  let {
    q,
    limit = 10,
    offset = 0,
    order = [['createdAt', 'DESC']],
  } = req.query;

  // Check if the query string is valid and search fields exist
  if (q && searchFields && searchFields.length > 0) {
    if (!Array.isArray(searchFields)) {
      return errorHandler(res, HttpStatusCode.InternalServerError, COMMON.API_ERRORS.INTERNAL_SERVER_ERROR)
    }

    if (like !== undefined) {
      if (typeof like !== 'boolean') {
        return errorHandler(res, HttpStatusCode.InternalServerError, COMMON.API_ERRORS.INTERNAL_SERVER_ERROR)
      }
    }
    const query = like ? `%${q}%` : q
    pagination.where = {
      [Op.or]: searchFields.map(field => ({[field]: {[Op.like]: query}}))
    }
  }

  // Check if the order is valid
  if (order !== undefined) {
    if (!Array.isArray(order)) {
      return errorHandler(res, HttpStatusCode.InternalServerError, COMMON.API_ERRORS.INTERNAL_SERVER_ERROR)
    } else if (order.length > 0) {
      pagination.order = order as Order
    }
  }

  // Check if the limit and offset are valid
  limit = Number(Number(limit).toFixed())
  offset = Number(Number(offset).toFixed())


  if (isNaN(limit)) {
    return errorHandler(res, httpStatus.BAD_REQUEST, COMMON.API_ERRORS.LIMIT_IS_NOT_VALID)
  }

  if (isNaN(offset)) {
    return errorHandler(res, httpStatus.BAD_REQUEST, COMMON.API_ERRORS.OFFSET_IS_NOT_VALID)
  }

  pagination.limit = parseInt(String(limit))
  pagination.offset = parseInt(String(offset))

  req.pagination = pagination

  next()
}
