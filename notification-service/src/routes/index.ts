import express from 'express';
import foundingListRouter from './foundingListRoutes/foundingListRoutes';

const rootRouter = express.Router()


rootRouter.use('/founding-list', foundingListRouter)



export default rootRouter;