import { Router } from 'express';
import { CreateCompaniesTest, getCompanies } from '../../controllers/admin/companies.controllers';
import verifyAdmin from '../../utils/verifyAdmin';

const companiesAdminRouter = Router();

companiesAdminRouter.get('/get', verifyAdmin, getCompanies);

// Create Companies Test
companiesAdminRouter.get('/create-test', CreateCompaniesTest);

export default companiesAdminRouter;