import { Router } from 'express';
import validate from '../../../middleware/validate';
import {forgotPasswordSchema, resetPasswordSchema, setPasswordSchema} from '../../../validations/password';
import {forgotPassword} from "./forget-password";
import {resetPassword} from "./reset-password";
import {setPassword} from "./set-password";
import authorization from "../../../middleware/authorization";
import {PASSWORD} from "../../../constants/password";

const passwordRouter = Router();

passwordRouter.post(
  PASSWORD.ENDPOINTS.forgotPassword,
  validate(forgotPasswordSchema),
  forgotPassword
);
passwordRouter.post(
  PASSWORD.ENDPOINTS.setPassword,
  authorization,
  validate(setPasswordSchema),
  setPassword
);
passwordRouter.post(
  PASSWORD.ENDPOINTS.resetPassword,
  validate(resetPasswordSchema),
  resetPassword
);

export default passwordRouter;
