import Joi from 'joi';
import type {EmailRequestBody} from '../types/types';
import {SetPasswordBody} from "../routes/v1/password-router/set-password";

export const forgotPasswordSchema = {
  body: Joi.object<EmailRequestBody>().keys({
    email: Joi
      .string()
      .required()
      .email(),
  })
};

export const resetPasswordSchema = {
  body: Joi.object().keys({
    newPassword: Joi.string()
      .required()
      .min(6)
  }),
  params: Joi.object().keys({
    token: Joi.string()
      .required()
      .min(1)
  })
};

export const setPasswordSchema = {
  body: Joi.object<SetPasswordBody>().keys({
    password: Joi.string()
      .optional()
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[^\s\t]{8,}$/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      })
    ,
    newPassword: Joi.string()
      .required()
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[^\s\t]{8,}$/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
  })
}
