import { Router } from "express";
import { LoginWeb } from "../../controllers/admin/auth.controllers";

const authAdminRouter = Router();

authAdminRouter.post('/login', LoginWeb);

export default authAdminRouter;