import {Router} from 'express';
import validate from '../../../middleware/validate';
import {signInSchema, signupSchema} from '../../../validations/auth.validation';
import {signup} from "./signup";
import {signIn} from "./signIn";
import {logout} from "./logout";
import {refresh} from "./refresh";
import {google} from "./google";
import {Auth} from "../../../constants/auth";

const authRouter = Router();

authRouter.post(Auth.endpoints.signUp, validate(signupSchema), signup);
authRouter.post(Auth.endpoints.signIn, validate(signInSchema), signIn);
authRouter.post(Auth.endpoints.logout, logout);
authRouter.post(Auth.endpoints.refresh, refresh);

// SocialLogin
authRouter.post(Auth.endpoints.google, google)

export default authRouter;
