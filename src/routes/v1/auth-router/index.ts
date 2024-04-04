import {Router} from 'express';
import validate from '../../../middleware/validate';
import {signInSchema, signupSchema} from '../../../validations/auth';
import {signup} from "./signup";
import {signIn} from "./signIn";
import {logout} from "./logout";
import {refresh} from "./refresh";
import {google} from "./google";
import {AUTH} from "../../../constants/auth";

const authRouter = Router();

authRouter.post(
  AUTH.ENDPOINTS.signUp,
  validate(signupSchema),
  signup
)
authRouter.post(
  AUTH.ENDPOINTS.signIn,
  validate(signInSchema),
  signIn
);
authRouter.post(
  AUTH.ENDPOINTS.logout,
  logout
);
authRouter.post(
  AUTH.ENDPOINTS.refresh,
  refresh
);

// SocialLogin
authRouter.post(
  AUTH.ENDPOINTS.google,
  google
)

export default authRouter;
