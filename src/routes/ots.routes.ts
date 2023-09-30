import { Router } from 'express';
import { GetMyOtById, GetMyOts } from '../controllers/ots.controllers';
import verifyToken from '../utils/passportAuth';

const otsRouter = Router();

otsRouter.get('/get', verifyToken, GetMyOts);
otsRouter.get('/get/:id', verifyToken, GetMyOtById);

export default otsRouter;