import { Router } from 'express';
import validate from '../../../middleware/validate';
import {sendVerifyEmailSchema, verifyEmailSchema} from '../../../validations/verifyEmail.validation';
import {sendVerificationEmail} from "./send-verification-email";
import {verifyAuthEmail, verifyJoinTeamEmail} from "./verify-email";
import isAuth from "../../../middleware/isAuth";

const verifyEmailRouter = Router();

verifyEmailRouter.post(
  '/send-verification-email',
  validate(sendVerifyEmailSchema),
  sendVerificationEmail
);

verifyEmailRouter.post(
  '/verify-email/:token',
  validate(verifyEmailSchema),
  verifyAuthEmail
);

verifyEmailRouter.post(
  '/verify-join-team-email/:token',
  validate(verifyEmailSchema),
  isAuth,
  verifyJoinTeamEmail
);

export default verifyEmailRouter;
