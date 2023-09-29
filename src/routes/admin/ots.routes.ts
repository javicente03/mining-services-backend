import { Router } from "express";
import { GetOTs } from "../../controllers/admin/ots.controllers";
import verifyAdmin from "../../utils/verifyAdmin";

const otsRouterAdmin = Router();

otsRouterAdmin.get("/get", verifyAdmin, GetOTs);

export default otsRouterAdmin;