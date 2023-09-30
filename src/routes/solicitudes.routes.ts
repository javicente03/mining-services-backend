import { Router } from "express";
import { AceptOrRejectBudget, CreateComponentesTest, CreateEquiposTest, CreateServicioTerrenoTest, CreateSolicitud, CreateTestTypes, GetFormComponentes, GetFormEquipos, GetFormServiciosTerreno, GetSolicitud, GetSolicitudes, GetTiposTrabajos } from "../controllers/solicitudes.controllers";
import verifyToken from "../utils/passportAuth";

const solicitudesRouter = Router();

solicitudesRouter.post("/create", verifyToken, CreateSolicitud);
solicitudesRouter.get("/get", verifyToken, GetSolicitudes);
solicitudesRouter.get("/get/:id", verifyToken, GetSolicitud);
solicitudesRouter.get("/types-work", verifyToken, GetTiposTrabajos);
solicitudesRouter.get("/form-equipment", verifyToken, GetFormEquipos);
solicitudesRouter.get("/form-components", verifyToken, GetFormComponentes);
solicitudesRouter.get("/form-ground-service", verifyToken, GetFormServiciosTerreno);
solicitudesRouter.put("/accept-budget/:id", verifyToken, AceptOrRejectBudget);
// CreateTestTypes
solicitudesRouter.get("/create-test-types", CreateTestTypes);
solicitudesRouter.get("/create-test-equipos", CreateEquiposTest);
solicitudesRouter.get("/create-test-componentes", CreateComponentesTest);
solicitudesRouter.get("/create-test-servicio-terrenos", CreateServicioTerrenoTest);

export default solicitudesRouter;