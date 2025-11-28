// // controllers/stripeWebhook.controller.ts
// import { Request, Response } from 'express';
// import { stripe } from "../../config/stripe.config";
// import { errorUtilities, responseUtilities } from '../../../../shared/utilities';
// import { StatusCodes } from '../../../../shared/statusCodes/statusCodes.responses';
// import transactionService from '../services/transaction.service';

// const stripeWebhookController = errorUtilities.withControllerErrorHandling(
//   async (request: Request, response: Response) => {
//     const sig = request.headers['stripe-signature'] as string;
//     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     if (!endpointSecret) {
//       return responseUtilities.responseHandler(
//         response,
//         'Webhook secret not configured',
//         StatusCodes.InternalServerError
//       );
//     }

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//     } catch (err: any) {
//       console.error(`Webhook signature verification failed.`, err.message);
//       return responseUtilities.responseHandler(
//         response,
//         `Webhook Error: ${err.message}`,
//         StatusCodes.BadRequest
//       );
//     }

//     // Handle the event
//     switch (event.type) {
//       case 'payment_intent.succeeded':
//         await transactionService.handlePaymentIntentSucceeded(event.data.object);
//         break;
//       case 'payment_intent.payment_failed':
//         await transactionService.handlePaymentIntentFailed(event.data.object);
//         break;
//       case 'charge.refunded':
//         await transactionService.handleChargeRefunded(event.data.object);
//         break;
//       case 'charge.dispute.created':
//         await transactionService.handleDisputeCreated(event.data.object);
//         break;
//       case 'charge.dispute.closed':
//         await transactionService.handleDisputeClosed(event.data.object);
//         break;
//       case 'invoice.payment_succeeded':
//         await transactionService.handleInvoicePaymentSucceeded(event.data.object);
//         break;
//       case 'invoice.payment_failed':
//         await transactionService.handleInvoicePaymentFailed(event.data.object);
//         break;
//       case 'customer.subscription.deleted':
//         await transactionService.handleSubscriptionDeleted(event.data.object);
//         break;
//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }

//     return responseUtilities.responseHandler(
//       response,
//       'Webhook processed successfully',
//       StatusCodes.OK
//     );
//   }
// );

// export default {
//   stripeWebhookController,
// };

import { stripeServices, transactionServices } from "../../services";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { Request, Response } from "express";
import { helpersUtilities } from "../../../../shared/utilities";
import { stripe } from "../../config/stripe.config";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { JwtPayload } from "jsonwebtoken";
// import transactionService from '../../services/transactionServices/transaction.services'

const createTransactionController = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const { userId } = request.user;
    console.log('testing', userId, request.body)
    const { amount, planType, status } = request.body;
    const transaction = await transactionServices.createTranscationService(
      amount,
      userId,
      planType,
      status
    );

    return responseUtilities.responseHandler(
      response,
      transaction.message,
      transaction.statusCode,
      transaction.data
    );
  }
);


const getUserTransactionsController = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const { userId } = request.user;
    const userTransactions = await transactionServices.getUserTransactionsService(userId)

    return responseUtilities.responseHandler(
      response,
      userTransactions.message,
      userTransactions.statusCode,
      userTransactions.data
    );
  }
);

export default {
  createTransactionController,
  getUserTransactionsController
};
