import { Router } from 'express';
import validate from '../../../middleware/validate';
import {forgotPasswordSchema, resetPasswordSchema} from '../../../validations/password.validation';
import {forgotPassword} from "./forget-password";
import {resetPassword} from "./reset-password";

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

export default passwordRouter;
