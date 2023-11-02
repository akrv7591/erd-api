import { Router } from 'express';
import validate from '../../../middleware/validate';
import {sendVerifyEmailSchema, verifyEmailSchema} from '../../../validations/verifyEmail.validation';
import {sendVerificationEmail} from "./send-verification-email";
import {verifyEmail} from "./verify-email";

const verifyEmailRouter = Router();

verifyEmailRouter.post(
  '/send-verification-email',
  validate(sendVerifyEmailSchema),
  sendVerificationEmail
);

verifyEmailRouter.post(
  '/verify-email/:token',
  validate(verifyEmailSchema),
  verifyEmail
);

export default verifyEmailRouter;
