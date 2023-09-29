import { Router } from "express";
import { GetOTs, GetOT, AssingBudget } from "../../controllers/admin/ots.controllers";
import verifyAdmin from "../../utils/verifyAdmin";

const otsRouterAdmin = Router();

otsRouterAdmin.get("/get", verifyAdmin, GetOTs);
otsRouterAdmin.get("/get/:id", verifyAdmin, GetOT);
otsRouterAdmin.post("/send-budget/:id", verifyAdmin, AssingBudget);

export default otsRouterAdmin;