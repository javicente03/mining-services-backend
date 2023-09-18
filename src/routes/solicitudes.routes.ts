import { Router } from "express";
import { CreateSolicitud, CreateTestTypes, GetSolicitud, GetSolicitudes, GetTiposTrabajos } from "../controllers/solicitudes.controllers";
import verifyToken from "../utils/passportAuth";

const solicitudesRouter = Router();

solicitudesRouter.post("/create", verifyToken, CreateSolicitud);
solicitudesRouter.get("/get", verifyToken, GetSolicitudes);
solicitudesRouter.get("/get/:id", verifyToken, GetSolicitud);
solicitudesRouter.get("/types-work", verifyToken, GetTiposTrabajos);
// CreateTestTypes
solicitudesRouter.get("/create-test-types", CreateTestTypes);

export default solicitudesRouter;