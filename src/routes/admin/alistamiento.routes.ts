import { Router } from 'express';
import { CheckAlistamiento, GetAlistamientoOT } from '../../controllers/admin/alistamiento.controllers';
import verifyAdmin from '../../utils/verifyAdmin';

const alistamientoAdminRouter = Router();

alistamientoAdminRouter.get('/:id', verifyAdmin, GetAlistamientoOT);
alistamientoAdminRouter.post('/check', verifyAdmin, CheckAlistamiento);

export default alistamientoAdminRouter;