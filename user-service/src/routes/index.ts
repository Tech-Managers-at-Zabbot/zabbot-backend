import express from 'express';
import authRoutes from './authRoutes/auth.routes';
import userRoutes from './userRoutes/user.routes';

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)

export default router