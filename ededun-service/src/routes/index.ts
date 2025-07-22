import { Router } from 'express';
import userRouter from './userRoutes/userRoutes';
import adminRouter from './adminRoutes/adminRoutes';

const rootRouter = Router();

rootRouter.use('/users', userRouter);
rootRouter.use('/admin', adminRouter);

export default rootRouter;
