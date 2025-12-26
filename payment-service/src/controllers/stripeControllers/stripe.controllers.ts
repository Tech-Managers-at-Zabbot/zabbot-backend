import { stripeServices } from "../../services";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { Request, Response } from "express";
import { helpersUtilities } from "../../../../shared/utilities";
import { stripe } from "../../config/stripe.config";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import transactionService from "../../services/transactionServices/transaction.services";
import Stripe from "stripe";
import { JwtPayload } from "jsonwebtoken";
import config from "../../../../config/config";

const createCheckoutSessionController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { subscriptionType } = request.body;
      const { userId } = request.user;
      const serviceResponse = await stripeServices.createCheckoutSession(
        subscriptionType,
        userId
      );

      return responseUtilities.responseHandler(
        response,
        serviceResponse.message,
        serviceResponse.statusCode,
        serviceResponse.data
      );
    }
  );

const stripeWebhookController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const signature = request.headers["stripe-signature"] as string;
    const endpointSecret = config.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed.`, err.message);
      return responseUtilities.responseHandler(
        response,
        `Webhook Error: ${err.message}`,
        StatusCodes.BadRequest
      );
    }

    // console.log("Event type:", event.type);

    switch (event.type) {
      // Initial payment
      case "checkout.session.completed":
        await stripeServices.handleCheckoutSessionCompleted(event.data.object);
        break;

      // Auto-renewal success
      case "invoice.payment_succeeded":
        await stripeServices.handleInvoicePaymentSucceeded(event.data.object);
        break;

      // Auto-renewal failed
      case "invoice.payment_failed":
        await stripeServices.handleInvoicePaymentFailed(event.data.object);
        break;

      // Subscription cancelled (after max retries or manual cancellation)
      case "customer.subscription.deleted":
        await stripeServices.handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.upcoming":
        await stripeServices.handleUpcomingInvoice(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return responseUtilities.responseHandler(
      response,
      "Webhook processed successfully",
      StatusCodes.OK
    );
  }
);


const cancelSubscriptionController = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const { subscriptionId } = request.params;
    const { cancelImmediately } = request.body;
    const { userId } = request.user;

    const serviceResponse = await stripeServices.cancelUserSubscription(
      userId,
      subscriptionId,
      cancelImmediately || false
    );

    return responseUtilities.responseHandler(
      response,
      serviceResponse.message,
      serviceResponse.statusCode,
      serviceResponse.data
    );
  }
);

const reactivateSubscriptionController = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const { subscriptionId } = request.params;
    const { userId } = request.user;

    const serviceResponse = await stripeServices.reactivateUserSubscription(
      userId,
      subscriptionId
    );

    return responseUtilities.responseHandler(
      response,
      serviceResponse.message,
      serviceResponse.statusCode,
      serviceResponse.data
    );
  }
);

export default {
  createCheckoutSessionController,
  stripeWebhookController,
  cancelSubscriptionController,
  reactivateSubscriptionController
};
