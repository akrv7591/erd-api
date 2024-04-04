import Joi from 'joi';
import {Validate} from "../types/types";
import {errorHandler} from "../utils/errorHandler";
import {HttpStatusCode} from "axios";
import {COMMON} from "../constants/common";


/**
 * This functions handles the validation of the given request validation schema
 *
 * @param {RequestValidationSchema} schema - The schema object can contain optional body, query, and params keys, each with a Joi schema object
 *
 * @returns Returns an HTTP response 400 BAD REQUEST if a validation error occurs or calls next if no error occurs
 *
 */
const validate: Validate = (schema) => (req, res, next) => {
  const {error} = Joi.object(schema).validate(
    {
      body: req.body,
      query: req.query,
      params: req.params
    },
    {abortEarly: false, stripUnknown: true}
  );
  if (!error) {
    next();
  } else {
    const errors = error.details.map((err) => ({
      field: err.path.join(', '),
      message: err.message
    }));

    errorHandler(res, HttpStatusCode.BadRequest, COMMON.API_ERRORS.BAD_REQUEST, errors)
  }
};

export default validate;
