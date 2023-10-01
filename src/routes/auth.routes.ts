import { Router } from "express";
import { CreateImageTest, CreateUsersTest, ForgotPassword, LeerImagenesEnBucket, Login, ResetPassword } from "../controllers/auth.controllers";

const authRouter = Router();

authRouter.post('/login', Login);
authRouter.post('/forgot-password', ForgotPassword);
authRouter.post('/reset-password', ResetPassword);

// TEST CREATE
authRouter.get('/create-user-test', CreateUsersTest);

// Create Image test en S3
authRouter.post('/create-image-test', CreateImageTest);
authRouter.get('/read-images', LeerImagenesEnBucket);

export default authRouter;