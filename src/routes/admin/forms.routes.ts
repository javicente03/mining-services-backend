import { Router } from 'express';
import { GetTiposComponentes } from '../../controllers/admin/forms.controllers';
import verifyAdmin from '../../utils/verifyAdmin';

const formsAdminRouter = Router();

formsAdminRouter.get('/get-components-types', verifyAdmin, GetTiposComponentes);

export default formsAdminRouter;