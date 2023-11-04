import express from "express";
import {Op, Order} from "sequelize";
import httpStatus from "http-status";
interface IPaginationOptions {
  searchFields?: string[],
  like?: boolean
}

export const pagination = ({searchFields, like}: IPaginationOptions) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const pagination: express.Request['pagination'] = {}

    const { q, limit, order, offset } = req.query;

    if (q && searchFields && searchFields.length > 0) {
      const query = like? `%${q}%`: q
      pagination.where = {
        [Op.or]:  searchFields.map(field => ({[field]: { [Op.like]: query}}))
      }
    }

    if (Array.isArray(order) && order.length > 0) {
      pagination.order = order as Order
    }

    if (limit || offset) {
      if (!limit && offset) return res.status(httpStatus.BAD_REQUEST).json({message: "if one of limit or offset exist both should exist"})

      try {
        pagination.limit = parseInt(String(limit))
        pagination.offset = parseInt(String(offset))
      } catch (e) {
        return res.status(httpStatus.BAD_REQUEST).json({message: "limit or order is not valid"})
      }
    }

    req.pagination = pagination

    next()
  }
