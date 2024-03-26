import {Router} from 'express';
import validate from '../../../middleware/validate';
import {loginSchema, signupSchema} from '../../../validations/auth.validation';
import {signup} from "./signup";
import {signIn} from "./signIn";
import {logout} from "./logout";
import {refresh} from "./refresh";
import {google} from "./google";

const authRouter = Router();

authRouter.post('/signup', validate(signupSchema), signup);
authRouter.post('/sign-in', validate(loginSchema), signIn);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refresh);

// SocialLogin
authRouter.post("/google", google)

export default authRouter;
