import express from 'express';
import foundingListRouter from './foundingListRoutes/foundingListRoutes';
import authNotificationRouter from './authNotificationRoutes/authNotification';

const rootRouter = express.Router()


rootRouter.use('/founding-list', foundingListRouter)
rootRouter.use('/auth-notification', authNotificationRouter)



export default rootRouter;