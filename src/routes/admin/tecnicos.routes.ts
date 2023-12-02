import { Router } from 'express';
import { AddTecnicoToOt, GetTecnicos, RemoveTecnicoFromOt } from '../../controllers/admin/tecnicos.controllers';
import verifyAdmin from '../../utils/verifyAdmin';

const tecnicosAdminRouter = Router();

tecnicosAdminRouter.get('/get', verifyAdmin, GetTecnicos);
tecnicosAdminRouter.post('/add-to-ot', AddTecnicoToOt);
tecnicosAdminRouter.delete('/remove-from-ot/:id', RemoveTecnicoFromOt);

export default tecnicosAdminRouter;