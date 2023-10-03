import { Router } from 'express';
import { CreateCompaniesTest, createCompany, getCompanies, getCompanyById, UpdateCompany } from '../../controllers/admin/companies.controllers';
import verifyAdmin from '../../utils/verifyAdmin';

const companiesAdminRouter = Router();

companiesAdminRouter.get('/get', verifyAdmin, getCompanies);
companiesAdminRouter.get('/get/:id', verifyAdmin, getCompanyById);
companiesAdminRouter.post('/create', verifyAdmin, createCompany);
companiesAdminRouter.put('/update/:id', verifyAdmin, UpdateCompany);

// Create Companies Test
companiesAdminRouter.get('/create-test', CreateCompaniesTest);

export default companiesAdminRouter;