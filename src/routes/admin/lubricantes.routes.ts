import { Router } from 'express';

import { GetLubricantesOT, CheckLubricante, UpdateLtsLubricante } from  '../../controllers/admin/lubicrantes.controllers';

const lubricantesAdminRouter = Router();

lubricantesAdminRouter.get('/:id', GetLubricantesOT);
lubricantesAdminRouter.post('/check', CheckLubricante);
lubricantesAdminRouter.put('/update', UpdateLtsLubricante);

export default lubricantesAdminRouter;