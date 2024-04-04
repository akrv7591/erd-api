import {NextFunction, Request, Response} from "express";
import {pagination, PaginationRequest, PaginationRequestQuery} from "../../src/middleware/pagination";
import {errorHandler} from "../../src/utils/errorHandler";
import {HttpStatusCode} from "axios";
import {COMMON} from "../../src/constants/common";

jest.mock("../../src/utils/errorHandler", () => ({
  errorHandler: jest.fn(),
}))

describe("pagination middleware", () => {
  let req: Partial<PaginationRequest>
  let res: Partial<Response>
  let next: jest.Mock<NextFunction>

  beforeEach(() => {
    req = {}
    res = {}
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // req.pagination.where
  it("should not have req.pagination.where if q is not provided", () => {
    req.query = {}
    pagination({})(req as PaginationRequest, res as Response, next)
    expect(req).toHaveProperty("pagination")
    expect(req).not.toHaveProperty("pagination.where")
    expect(next).toBeCalled()
  })

  it("should not to have pagination.where if searchFields is not provided", () => {
    req.query = {q: "search"}
    pagination({})(req as PaginationRequest, res as Response, next)
    expect(req).toHaveProperty("pagination")
    expect(req).not.toHaveProperty("pagination.where")
    expect(next).toBeCalled()
  })

  it("should return InternalError if q and like is valid but searchFields is not an array", () => {
    req.query = {q: "search"}
    pagination({searchFields: "name" as unknown as []})(req as PaginationRequest, res as Response, next)
    expect(errorHandler).toBeCalledWith(req, res, HttpStatusCode.InternalServerError, COMMON.API_ERRORS.INTERNAL_SERVER_ERROR)
  })

  it("should return InternalError if q and searchFields valid and like is defined but it is not boolean", () => {
    req.query = {q: "search"}
    pagination({searchFields: ["name"], like: "true" as unknown as boolean})(req as PaginationRequest, res as Response, next)
    expect(errorHandler).toBeCalledWith(req, res, HttpStatusCode.InternalServerError, COMMON.API_ERRORS.INTERNAL_SERVER_ERROR)
  })

  it("should not to have req.pagination.where if searchFields length is 0", () => {
    req.query = {q: "search"}
    pagination({searchFields: []})(req as PaginationRequest, res as Response, next)
    expect(req).toHaveProperty("pagination")
    expect(req).not.toHaveProperty("pagination.where")
    expect(next).toBeCalled()
  })

  it("should have req.pagination.where", () => {
    req.query = {q: "search"}
    pagination({searchFields: ["name"]})(req as Request, res as Response, next)
    expect(req).toHaveProperty("pagination")
    expect(req).toHaveProperty("pagination.where")
    expect(next).toBeCalled()
  })

  //req.pagination.order
  it("should have default order value if req.query.order is not provided", () => {
    req.query = {}
    pagination({})(req as PaginationRequest, res as Response, next)
    expect(req).toHaveProperty("pagination")
    expect(req).toHaveProperty("pagination.order")
    expect(req.pagination?.order).toEqual(["createdAt", "DESC"])
    expect(next).toBeCalled()
  })

  it("should return InternalError if req.query.order is provided but it is not an array", () => {
    req.query = {order: "name" as unknown as PaginationRequestQuery['order']}
    pagination({})(req as PaginationRequest, res as Response, next)
    expect(errorHandler).toBeCalledWith(req, res, HttpStatusCode.InternalServerError, COMMON.API_ERRORS.INTERNAL_SERVER_ERROR)
  })

  it("should not have req.pagination.order if order length is 0", () => {
    req.query = {order: []}
    pagination({})(req as PaginationRequest, res as Response, next)
    expect(req).not.toHaveProperty("pagination.order")
    expect(next).toBeCalled()
  })

  //req.pagination.limit and offset
  it("should have default limit and offset value if req.query.limit amd req.query.offset is not provided but", () => {
    req.query = {}
    pagination({})(req as PaginationRequest, res as Response, next)
    expect(req).toHaveProperty("pagination")
    expect(req).toHaveProperty("pagination.limit")
    expect(req).toHaveProperty("pagination.offset")
    expect(req.pagination?.limit).toEqual(10)
    expect(req.pagination?.offset).toEqual(0)
    expect(next).toBeCalled()
  })

  it("should return BadRequestError if req.query.limit is provided but it is not a numeric string or a number", () => {
    req.query = {limit: "not a number"}
    pagination({})(req as PaginationRequest, res as Response, next)
    expect(errorHandler).toBeCalledWith(req, res, HttpStatusCode.BadRequest, COMMON.API_ERRORS.LIMIT_IS_NOT_VALID)
  })

  it("should return BadRequestError if req.query.offset is provided but it is not a numeric string or a number", () => {
    req.query = {offset: "not a number"}
    pagination({})(req as PaginationRequest, res as Response, next)
    expect(errorHandler).toBeCalledWith(req, res, HttpStatusCode.BadRequest, COMMON.API_ERRORS.OFFSET_IS_NOT_VALID)
  })

})
