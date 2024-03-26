import { Router } from 'express';
import validate from '../../../middleware/validate';
import {sendVerifyEmailSchema, verifyEmailSchema} from '../../../validations/verifyEmail.validation';
import {sendVerificationEmail} from "./send-verification-email";
import {verifyAuthEmail, verifyJoinTeamEmail} from "./verify-email";
import isAuth from "../../../middleware/isAuth";
import {EmailVerification} from "../../../constants/emailVerification";

const verifyEmailRouter = Router();

verifyEmailRouter.post(
  EmailVerification.endpoints.sendVerificationEmail,
  validate(sendVerifyEmailSchema),
  sendVerificationEmail
);

verifyEmailRouter.post(
  EmailVerification.endpoints.verifyEmail,
  validate(verifyEmailSchema),
  verifyAuthEmail
);

verifyEmailRouter.post(
  EmailVerification.endpoints.verifyJoinTeamEmail,
  isAuth,
  validate(verifyEmailSchema),
  verifyJoinTeamEmail
);

export default verifyEmailRouter;
