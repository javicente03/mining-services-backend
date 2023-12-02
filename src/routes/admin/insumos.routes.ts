import { Router } from 'express';

import { CreateInsumo, DeleteInsumo, GetInsumo, GetInsumos, UpdateInsumo } from '../../controllers/admin/insumos.controllers';
import verifyAdmin from '../../utils/verifyAdmin';

const insumosRouterAdmin = Router();

insumosRouterAdmin.get('/get', verifyAdmin, GetInsumos);
insumosRouterAdmin.post('/create', verifyAdmin, CreateInsumo);
insumosRouterAdmin.put('/update/:id', verifyAdmin, UpdateInsumo);
insumosRouterAdmin.delete('/delete/:id', verifyAdmin, DeleteInsumo);
insumosRouterAdmin.get('/get/:id', verifyAdmin, GetInsumo);

export default insumosRouterAdmin;