import express from 'express';
import stripeRoutes from './paymentRoutes/stripe.routes';
import transactionRoutes from './transactionRoutes/transactions.routes';
import subscriptionRoutes from './subscriptionRoutes/subscriptions.routes';

const router = express.Router()

router.use('/stripe', stripeRoutes)
router.use('/transactions', transactionRoutes)
router.use('/subscription-plans', subscriptionRoutes)

export default router