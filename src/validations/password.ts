import Joi from 'joi';
import {SetPasswordBody} from "../routes/v1/password-router/set-password";
import {EmailRequestBody} from "../routes/v1/verify-email/send-verification-email";
import {PASSWORD} from "../constants/password";

export const forgotPasswordSchema = {
  body: Joi.object<EmailRequestBody>().keys({
    email: Joi
      .string()
      .required()
      .email()
      .messages({
        'string.base': 'Email must be a string',
        'string.email': 'Email must be a valid email',
      })
  })
};

export const resetPasswordSchema = {
  body: Joi.object().keys({
    newPassword: Joi.string()
      .required()
      .min(PASSWORD.MIN_LENGTH)
      .messages({
        'string.base': 'Password must be a string',
        'string.min': `Password must be at least ${PASSWORD.MIN_LENGTH} characters long`,
      })
  }),
  params: Joi.object().keys({
    token: Joi.string()
      .required()
      .min(1)
      .messages({
        'string.base': 'Token must be a string',
        'string.min': 'Token must be at least 1 character long',
      })
  })
};

export const setPasswordSchema = {
  body: Joi.object<SetPasswordBody>().keys({
    password: Joi.string()
      .optional()
      .regex(PASSWORD.REGEX)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      })
    ,
    newPassword: Joi.string()
      .required()
      .regex(PASSWORD.REGEX)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
  })
}
