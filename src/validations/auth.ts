import Joi from 'joi';
import type {
  UserLoginCredentials,
  UserSignUpCredentials
} from '../types/types';
import {PASSWORD} from "../constants/password";

export const signupSchema = {
  body: Joi.object<UserSignUpCredentials>().keys({
    email: Joi.string().required().email().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email',
    }),
    password: Joi.string().required().min(PASSWORD.MIN_LENGTH).regex(PASSWORD.REGEX).messages({
      'string.base': 'Password must be a string',
      'string.min': `Password must be at least ${PASSWORD.MIN_LENGTH} characters long`,
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
    name: Joi.string().required().min(2).messages({
      'string.base': 'Name must be a string',
      'string.min': `Name must be at least 2 characters long`,
    })
  })
};

export const signInSchema = {
  body: Joi.object<UserLoginCredentials>().keys({
    email: Joi.string().required().email().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email',
    }),
    password: Joi.string().required().messages({
      'string.base': 'Password must be a string',
    })
  })
};
