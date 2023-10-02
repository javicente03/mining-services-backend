import { Router } from 'express';
import { CreateUsersTest, getUsers } from '../../controllers/admin/users.controllers';
import verifyAdmin from '../../utils/verifyAdmin';

const usersAdminRouter = Router();

usersAdminRouter.get('/get', verifyAdmin, getUsers);

// Create Users Test
usersAdminRouter.get('/create-test', CreateUsersTest);

export default usersAdminRouter;