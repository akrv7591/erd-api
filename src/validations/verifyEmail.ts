import Joi from 'joi';
import {EmailRequestBody} from "../routes/v1/verify-email/send-verification-email";

export const sendVerifyEmailSchema = {
  body: Joi.object<EmailRequestBody>().keys({
    email: Joi.string().required().email().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email',
    })
  })
};

export const verifyEmailSchema = {
  params: Joi.object().keys({
    token: Joi.string().required().min(1).messages({
      'string.base': 'Token must be a string',
      'string.min': 'Token must be at least 1 character long',
    })
  })
};
