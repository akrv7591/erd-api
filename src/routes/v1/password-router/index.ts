import { Router } from 'express';
import validate from '../../../middleware/validate';
import {forgotPasswordSchema, resetPasswordSchema, setPasswordSchema} from '../../../validations/password.validation';
import {forgotPassword} from "./forget-password";
import {resetPassword} from "./reset-password";
import {setPassword} from "./set-password";
import isAuth from "../../../middleware/isAuth";

const passwordRouter = Router();

passwordRouter.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  forgotPassword
);
passwordRouter.post(
  '/reset-password/:token',
  validate(resetPasswordSchema),
  resetPassword
);

passwordRouter.post(
  '/set-password',
  isAuth,
  validate(setPasswordSchema),
  setPassword
)

export default passwordRouter;
