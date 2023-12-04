import { Router } from 'express';
import { CreateOt0Child, GetOtsChildren } from '../../controllers/admin/children.controllers';
import verifyAdmin from '../../utils/verifyAdmin';

const childrenOtAdminRouter = Router();

childrenOtAdminRouter.post('/create-ot', verifyAdmin, CreateOt0Child);
childrenOtAdminRouter.get('/get-children/:otId', verifyAdmin, GetOtsChildren);

export default childrenOtAdminRouter;