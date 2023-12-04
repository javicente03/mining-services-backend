import { Router } from 'express';

import { GetTrabajosExternos, PostTrabajoExterno } from '../../controllers/admin/trabajos_externos.controllers';

const trabajosExternosAdminRouter = Router();

trabajosExternosAdminRouter.get('/get/:id', GetTrabajosExternos);
trabajosExternosAdminRouter.post('/save/:id', PostTrabajoExterno);

export default trabajosExternosAdminRouter;