import { Router } from "express";
import { CreateUsersTest, ForgotPassword, Login, ResetPassword } from "../controllers/auth.controllers";

const authRouter = Router();

authRouter.post('/login', Login);
authRouter.post('/forgot-password', ForgotPassword);
authRouter.post('/reset-password', ResetPassword);

// TEST CREATE
authRouter.get('/create-user-test', CreateUsersTest);

export default authRouter;