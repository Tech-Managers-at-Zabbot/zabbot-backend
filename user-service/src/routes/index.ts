import express from 'express';
import authRoutes from './authRoutes/auth.routes';
import userRoutes from './userRoutes/user.routes';
import userNotificationRoutes from './userNotificationRoutes/userNotifications.routes';

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/user-notifications', userNotificationRoutes)

export default router