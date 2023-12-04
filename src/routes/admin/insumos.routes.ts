import { Router } from 'express';

import { AddInsumoOt, CreateInsumo, DeleteInsumo, DeleteInsumoOt, GetInsumo, GetInsumos, UpdateInsumo, UpdateInsumoOt } from '../../controllers/admin/insumos.controllers';
import verifyAdmin from '../../utils/verifyAdmin';

const insumosRouterAdmin = Router();

insumosRouterAdmin.get('/get', verifyAdmin, GetInsumos);
insumosRouterAdmin.post('/create', verifyAdmin, CreateInsumo);
insumosRouterAdmin.put('/update/:id', verifyAdmin, UpdateInsumo);
insumosRouterAdmin.delete('/delete/:id', verifyAdmin, DeleteInsumo);
insumosRouterAdmin.get('/get/:id', verifyAdmin, GetInsumo);
insumosRouterAdmin.post('/add-ot/:id', verifyAdmin, AddInsumoOt);
insumosRouterAdmin.delete('/delete-ot', verifyAdmin, DeleteInsumoOt);
insumosRouterAdmin.put('/update-ot', verifyAdmin, UpdateInsumoOt);

export default insumosRouterAdmin;