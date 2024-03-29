import { Router } from 'express';
import validate from '../../../middleware/validate';
import {sendVerifyEmailSchema, verifyEmailSchema} from '../../../validations/verifyEmail';
import {sendVerificationEmail} from "./send-verification-email";
import {verifyAuthEmail, verifyJoinTeamEmail} from "./verify-email";
import authorization from "../../../middleware/authorization";
import {EMAIL_VERIFICATION} from "../../../constants/emailVerification";

const verifyEmailRouter = Router();

verifyEmailRouter.post(
  EMAIL_VERIFICATION.ENDPOINTS.sendVerificationEmail,
  validate(sendVerifyEmailSchema),
  sendVerificationEmail
);

verifyEmailRouter.post(
  EMAIL_VERIFICATION.ENDPOINTS.verifyEmail,
  validate(verifyEmailSchema),
  verifyAuthEmail
);

verifyEmailRouter.post(
  EMAIL_VERIFICATION.ENDPOINTS.verifyJoinTeamEmail,
  authorization,
  validate(verifyEmailSchema),
  verifyJoinTeamEmail
);

export default verifyEmailRouter;
