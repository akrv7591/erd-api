import Joi from 'joi';
import {isCuid} from "@paralleldrive/cuid2";
import {UserDetailParams} from "../routes/v1/user-router/userDetail";

export const userDetailOrPatchSchema = {
  params: Joi.object<UserDetailParams>().keys({
    userId: Joi.string().required().custom(value => isCuid(value)).messages({
      'string.base': 'User id must be a string',
      'string.custom': 'User id must be a valid cuid',
    })
  }),
};
