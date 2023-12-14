import {Router} from 'express';
import validate from '../../../middleware/validate';
import {loginSchema, signupSchema} from '../../../validations/auth.validation';
import {signup} from "./signup";
import {signin} from "./signin";
import {logout} from "./logout";
import {refresh} from "./refresh";
import {google} from "./google";

const authRouter = Router();

authRouter.post('/signup', validate(signupSchema), signup);
authRouter.post('/signin', validate(loginSchema), signin);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refresh);

// SocialLogin
authRouter.post("/google", google)

export default authRouter;
