import express from 'express';
import stripeRoutes from './paymentRoutes/stripe.routes';
import transactionRoutes from './transactionRoutes/transactions.routes';

const router = express.Router()

router.use('/stripe', stripeRoutes)
router.use('/transactions', transactionRoutes)

export default router