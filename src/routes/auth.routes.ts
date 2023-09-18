import { Router } from "express";
import { ForgotPassword, Login, ResetPassword } from "../controllers/auth.controllers";

const authRouter = Router();

authRouter.post('/login', Login);
authRouter.post('/forgot-password', ForgotPassword);
authRouter.post('/reset-password', ResetPassword);

export default authRouter;