import express from 'express';
import stripeRoutes from './paymentRoutes/stripe.routes';

const router = express.Router()

router.use('/stripe', stripeRoutes)

export default router