import { Router } from 'express';
import { CleanRuts, createUser, CreateUsersTest, getUserById, getUsersUser, updateUser } from '../../controllers/admin/users.controllers';
import verifyAdmin from '../../utils/verifyAdmin';

const usersAdminRouter = Router();

usersAdminRouter.get('/get', verifyAdmin, getUsersUser);
usersAdminRouter.get('/get-users', verifyAdmin, getUsersUser);
usersAdminRouter.get('/get/:id', verifyAdmin, getUserById);
usersAdminRouter.post('/create', verifyAdmin, createUser);
usersAdminRouter.put('/update/:id', verifyAdmin, updateUser);
usersAdminRouter.get('/clean-rut', CleanRuts);

// Create Users Test
usersAdminRouter.get('/create-test', CreateUsersTest);

export default usersAdminRouter;