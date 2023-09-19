import { Router } from "express";
import { GetSolicitud, GetSolicitudes, ResponseSolicitud } from "../../controllers/admin/solicitudes.controllers";
import verifyAdmin from "../../utils/verifyAdmin";

const solicitudesRouterAdmin = Router();

solicitudesRouterAdmin.get("/get", verifyAdmin, GetSolicitudes);
solicitudesRouterAdmin.get("/get/:id", verifyAdmin, GetSolicitud);
solicitudesRouterAdmin.post("/send-status/:id", verifyAdmin, ResponseSolicitud);

export default solicitudesRouterAdmin;