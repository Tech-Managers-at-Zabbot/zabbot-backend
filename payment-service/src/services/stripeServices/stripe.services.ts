import { helperFunctions } from "../../utilities/index";
import usersRepositories from "../../repositories/paymentRepositories/payment.repositories";
import {
  responseUtilities,
  errorUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { StripeResponses } from "../../responses/stripe.responses";
import { PaymentOptions } from "../../types/payment.types";
import { stripe } from "../../config/stripe.config";
import config from "../../../../config/config";
import {
  PaymentGateway,
  TransactionStatus,
  TransactionType,
} from "../../../../shared/entities/payment-service-entities/transactions/transactions";
import { SubscriptionStatus } from "../../../../shared/entities/payment-service-entities/subscriptions/userSubscriptions";
import Stripe from "stripe";
import { v4 } from "uuid";
import transactionsRepositories from "../../repositories/transationRepositories/transaction.repositories";
import { userSubscriptionService } from "../index";
import userSubscriptionRepositories from "../../repositories/userSubscirptionRepositories/userSubscription.repositories";
import subscriptionPlanRepositories from "../../repositories/subscriptionRepositories/subscription.repositories";

const TRIAL_PERIOD_DAYS = 7;

const createCheckoutSession = errorUtilities.withServiceErrorHandling(
  async (subscriptionType: string, userId: string, useremail: string) => {
    const plan = await subscriptionPlanRepositories.getOne({
      planType: subscriptionType,
    });

    if (!plan) {
      throw errorUtilities.createError(
        "Subscription plan not found",
        StatusCodes.NotFound,
      );
    }

    const user = await usersRepositories.getOne({ id: userId });

    if (!user) {
      throw errorUtilities.createError("User not found", StatusCodes.NotFound);
    }

    const isFirstTimeSubscriber = Number(user.noOfSubscriptions || 0) === 0;
    const existingCustomerId = user.stripeCustomerId || undefined;

    let priceId: string;
    let paymentMode: "subscription" | "payment" | "setup" = "subscription";
    let initialTransactionStatus = TransactionStatus.PENDING;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      success_url: `${config.STRIPE_SUCCESS_URL}?type=${subscriptionType}`,
      cancel_url: `${config.STRIPE_FAILURE_URL}?type=${subscriptionType}`,
      metadata: {
        userId,
        planId: plan.id,
        planType: plan.planType,
      },
      customer_email: useremail,
      ...(existingCustomerId ? { customer: existingCustomerId } : {}),
    };

    switch (subscriptionType) {
      case PaymentOptions.MONTHLY_SUBSCRIPTION:
        priceId = process.env.MONTHLY_SUBSCRIPTION_PRICE_ID || "";
        paymentMode = "subscription";
        break;
      case PaymentOptions.ANNUAL_SUBSCRIPTION:
        priceId = process.env.ANNUAL_SUBSCRIPTION_PRICE_ID || "";
        paymentMode = "subscription";
        break;
      case PaymentOptions.LIFETIME_SUBSCRIPTION:
        priceId = process.env.LIFTIME_SUBSCRIPTION_PRICE_ID || "";
        // First-time subscribers: save the card now (no charge), the delayed-charge
        // cron job triggers the actual one-time payment after the 7-day trial.
        // Repeat purchasers: charge immediately, as before.
        paymentMode = isFirstTimeSubscriber ? "setup" : "payment";
        break;
      default:
        throw errorUtilities.createError(
          StripeResponses.INVALID_SUBSCRIPTION_TYPE,
          StatusCodes.BadRequest,
        );
    }

    if (paymentMode === "setup") {
      // Setup mode only collects/saves a payment method - no line items, no charge.
      initialTransactionStatus = TransactionStatus.TRIALING;
    } else {
      sessionParams.payment_method_types = ["card"];
      sessionParams.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];

      if (paymentMode === "subscription" && isFirstTimeSubscriber) {
        sessionParams.subscription_data = {
          trial_period_days: TRIAL_PERIOD_DAYS,
        };
      }
    }

    sessionParams.mode = paymentMode;

    try {
      const session = await stripe.checkout.sessions.create(sessionParams);
      const transactionData = {
        id: v4(),
        userId,
        paymentGateway: PaymentGateway.STRIPE,
        gatewayTransactionId: session.id,
        gatewayCustomerId: (session.customer as string) || null,
        transactionType: TransactionType.SUBSCRIPTION,
        amount: plan.price,
        currency: plan.currency,
        status: initialTransactionStatus,
        planType: plan.planType,
        planId: plan.id,
        description: `${plan.planType} subscription payment`,
        metadata: {
          checkoutSessionId: session.id,
          planName: plan.planType,
        },
      };

      const transaction =
        await transactionsRepositories.create(transactionData);
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        StripeResponses.PROCESS_SUCCESSFUL,
        {
          sessionId: session.id,
          sessionUrl: session.url,
          transactionId: transaction.id,
        },
      );
    } catch (error: any) {
      console.error("Error creating Stripe checkout session:", error);
      throw errorUtilities.createError(
        `${StripeResponses.UNSUCCESSFUL_PROCESS}: ${error.message}`,
        StatusCodes.InternalServerError,
      );
    }
  },
);

// Handle payment_intent.succeeded
const handlePaymentIntentSucceeded = errorUtilities.withServiceErrorHandling(
  async (session: any) => {
    console.log("Processing succeeded:", session);

    const transaction = await transactionsRepositories.getOne({
      gatewayTransactionId: session.id,
      paymentGateway: PaymentGateway.STRIPE,
    });

    console.log("trans", transaction);

    if (!transaction) {
      console.warn(`Transaction not found for payment intent: ${session.id}`);
      return;
    }

    const transactionUpdate = await transactionsRepositories.updateOne(
      {
        gatewayTransactionId: session.id,
        paymentGateway: PaymentGateway.STRIPE,
      },
      {
        status: TransactionStatus.SUCCESS,
        paidAt: new Date(),
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        paymentMethod: "card",
        metadata: {
          ...transaction.metadata,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          stripeSubscriptionId: session.subscription,
        },
      },
    );
    if (
      transaction.transactionType === TransactionType.SUBSCRIPTION ||
      transaction.transactionType === TransactionType.RENEWAL
    ) {
      await userSubscriptionService.createOrUpdateUserSubscription(transaction);
    }

    console.log(
      `Payment succeeded for transaction: ${transaction.id}, ${transactionUpdate}`,
    );
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      StripeResponses.PROCESS_SUCCESSFUL,
      transactionUpdate,
    );
  },
);

// Handle payment_intent.payment_failed
const handlePaymentIntentFailed = errorUtilities.withServiceErrorHandling(
  async (session: any) => {
    console.log("Processing payment_intent.payment_failed:", session.id);

    const transaction = await transactionsRepositories.getOne({
      gatewayTransactionId: session.id,
      paymentGateway: PaymentGateway.STRIPE,
    });

    if (!transaction) {
      console.warn(`Transaction not found for payment intent: ${session.id}`);
      return;
    }

    const transactionUpdate = await transactionsRepositories.updateOne(
      {
        gatewayTransactionId: session.id,
        paymentGateway: PaymentGateway.STRIPE,
      },
      {
        status: TransactionStatus.FAILED,
        failedAt: new Date(),
        failureReason: session.last_payment_error?.message || "Payment failed",
        failureCode: session.last_payment_error?.code || "unknown",
        paymentMethod: "card",
        metadata: {
          ...transaction.metadata,
          stripeError: session.last_payment_error,
        },
      },
    );

    console.log(`Payment failed for transaction: ${transaction.id}`);
    return responseUtilities.handleServicesResponse(
      StatusCodes.NotImplemented,
      StripeResponses.UNSUCCESSFUL_PROCESS,
      transactionUpdate,
    );
  },
);

// Handle customer.subscription.deleted
const handleSubscriptionDeleted = errorUtilities.withServiceErrorHandling(
  async (subscription: any) => {
    console.log("Processing customer.subscription.deleted:", subscription.id);

    const userSubscription = await userSubscriptionRepositories.getOne({
      gatewaySubscriptionId: subscription.id,
    });

    if (!userSubscription) {
      console.warn(`Subscription not found for: ${subscription.id}`);
      return;
    }

    // Only update if not already cancelled (handles both immediate and period-end cancellations)
    if (userSubscription.status !== SubscriptionStatus.CANCELLED) {
      await userSubscriptionRepositories.updateOne(
        { id: userSubscription.id },
        {
          status: SubscriptionStatus.CANCELLED,
          endDate: new Date(),
          metadata: {
            finalizedAt: new Date(),
          },
        },
      );
    }

    console.log(`Subscription finalized as cancelled: ${subscription.id}`);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Subscription deletion processed",
      userSubscription,
    );
  },
);

const handleInvoicePaymentSucceeded = errorUtilities.withServiceErrorHandling(
  async (invoice: any) => {
    console.log("Processing invoice.payment_succeeded:", invoice.id);

    // Skip if this is the first invoice (already handled by checkout.session.completed)
    if (invoice.billing_reason === "subscription_create") {
      console.log(
        "Skipping first invoice - already handled by checkout.session.completed",
      );
      return;
    }

    // This handles subscription renewals
    const subscriptionId = invoice.subscription;
    const customerId = invoice.customer;

    // Find the user's existing subscription by Stripe subscription ID
    const userSubscription = await userSubscriptionRepositories.getOne({
      gatewaySubscriptionId: subscriptionId,
      status: SubscriptionStatus.ACTIVE,
    });

    if (!userSubscription) {
      console.warn(
        `Active subscription not found for Stripe subscription: ${subscriptionId}`,
      );
      return;
    }

    const plan = (await subscriptionPlanRepositories.getOne({
      id: userSubscription.planId,
    })) as unknown as any;

    const transactionData = {
      id: v4(),
      userId: userSubscription.userId,
      paymentGateway: PaymentGateway.STRIPE,
      gatewayTransactionId: invoice.id,
      gatewayCustomerId: customerId,
      gatewaySubscriptionId: subscriptionId,
      transactionType: TransactionType.RENEWAL,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: TransactionStatus.SUCCESS,
      planType: plan.planType,
      planId: userSubscription.planId,
      paidAt: new Date(invoice.status_updated_at * 1000),
      paymentMethod: "card",
      description: `${plan.planType} subscription renewal`,
      metadata: {
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: subscriptionId,
        stripePaymentIntentId: invoice.payment_intent,
        billingReason: invoice.billing_reason,
        invoiceUrl: invoice.hosted_invoice_url,
      },
    };

    const transaction = await transactionsRepositories.create(transactionData);

    // Trial (if any) has now converted to a real paid period - trialEndsAt
    // isn't passed here, so createOrUpdateUserSubscription clears it.
    const periodEnd = invoice.lines?.data?.[0]?.period?.end
      ? new Date(invoice.lines.data[0].period.end * 1000)
      : null;

    await userSubscriptionService.createOrUpdateUserSubscription(transaction, {
      stripeDates: { periodEnd },
    });

    console.log(`Renewal payment succeeded for transaction: ${transaction.id}`);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      StripeResponses.PROCESS_SUCCESSFUL,
      transaction,
    );
  },
);

const handleCheckoutSessionCompleted = errorUtilities.withServiceErrorHandling(
  async (session: any) => {
    console.log("Processing checkout.session.completed:", session.id);

    const transaction = await transactionsRepositories.getOne({
      gatewayTransactionId: session.id,
      paymentGateway: PaymentGateway.STRIPE,
    });

    if (!transaction) {
      console.warn(`Transaction not found for checkout session: ${session.id}`);
      return;
    }

    if (session.mode === "setup") {
      // Lifetime plan trial grant: no charge yet, just save the card and give
      // access now. The delayed-charge cron job bills the saved card in 7 days.
      const setupIntent = await stripe.setupIntents.retrieve(
        session.setup_intent as string,
      );
      const paymentMethodId = setupIntent.payment_method as string;
      const customerId = session.customer as string;
      const trialEndsAt = new Date(
        Date.now() + TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000,
      );

      if (customerId) {
        const user = await usersRepositories.getOne({ id: transaction.userId });
        if (user && !user.stripeCustomerId) {
          await usersRepositories.updateOne(
            { id: transaction.userId },
            { stripeCustomerId: customerId },
          );
        }
      }

      const transactionUpdate = await transactionsRepositories.updateOne(
        {
          gatewayTransactionId: session.id,
          paymentGateway: PaymentGateway.STRIPE,
        },
        {
          status: TransactionStatus.TRIALING,
          gatewayCustomerId: customerId,
          paymentMethodId,
          scheduledChargeAt: trialEndsAt,
          metadata: {
            ...transaction.metadata,
            stripeSessionId: session.id,
            stripeSetupIntentId: session.setup_intent,
          },
        },
      );

      await userSubscriptionService.createOrUpdateUserSubscription(
        transaction,
        { grantTrialOnly: true, stripeDates: { trialEndsAt } },
      );

      console.log(`Lifetime trial granted for transaction: ${transaction.id}`);
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        StripeResponses.PROCESS_SUCCESSFUL,
        transactionUpdate,
      );
    }

    if (session.mode === "subscription") {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      const isTrialing = stripeSubscription.status === "trialing";
      // Stripe moved current_period_end/start to the subscription item level.
      const currentPeriodEnd =
        stripeSubscription.items.data[0]?.current_period_end;
      const periodEnd = currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null;
      const trialEndsAt = stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null;

      const transactionUpdate = await transactionsRepositories.updateOne(
        {
          gatewayTransactionId: session.id,
          paymentGateway: PaymentGateway.STRIPE,
        },
        isTrialing
          ? {
              // No charge yet - Stripe won't bill until the trial ends.
              status: TransactionStatus.TRIALING,
              gatewayCustomerId: session.customer as string,
              gatewaySubscriptionId: session.subscription as string,
              metadata: {
                ...transaction.metadata,
                stripeSessionId: session.id,
                stripeSubscriptionId: session.subscription,
              },
            }
          : {
              status: TransactionStatus.SUCCESS,
              paidAt: new Date(),
              amount: session.amount_total / 100,
              currency: session.currency.toUpperCase(),
              paymentMethod: "card",
              gatewayCustomerId: session.customer as string,
              gatewaySubscriptionId: session.subscription as string,
              metadata: {
                ...transaction.metadata,
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent,
                stripeSubscriptionId: session.subscription,
              },
            },
      );

      if (
        transaction.transactionType === TransactionType.SUBSCRIPTION ||
        transaction.transactionType === TransactionType.RENEWAL
      ) {
        await userSubscriptionService.createOrUpdateUserSubscription(
          transaction,
          { stripeDates: { trialEndsAt, periodEnd } },
        );
      }

      console.log(
        `Subscription checkout completed for transaction: ${transaction.id}`,
      );
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        StripeResponses.PROCESS_SUCCESSFUL,
        transactionUpdate,
      );
    }

    // mode === "payment": lifetime plan, repeat purchaser - unchanged immediate charge.
    const transactionUpdate = await transactionsRepositories.updateOne(
      {
        gatewayTransactionId: session.id,
        paymentGateway: PaymentGateway.STRIPE,
      },
      {
        status: TransactionStatus.SUCCESS,
        paidAt: new Date(),
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        paymentMethod: "card",
        gatewayCustomerId: session.customer as string,
        metadata: {
          ...transaction.metadata,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
        },
      },
    );

    if (
      transaction.transactionType === TransactionType.SUBSCRIPTION ||
      transaction.transactionType === TransactionType.RENEWAL
    ) {
      await userSubscriptionService.createOrUpdateUserSubscription(transaction);
    }

    console.log(`Payment succeeded for transaction: ${transaction.id}`);
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      StripeResponses.PROCESS_SUCCESSFUL,
      transactionUpdate,
    );
  },
);

// Handle failed renewal payments
const handleInvoicePaymentFailed = errorUtilities.withServiceErrorHandling(
  async (invoice: any) => {
    console.log("Processing invoice.payment_failed:", invoice.id);

    const subscriptionId = invoice.subscription;

    const userSubscription = await userSubscriptionRepositories.getOne({
      gatewaySubscriptionId: subscriptionId,
    });

    if (!userSubscription) {
      console.warn(`Subscription not found for: ${subscriptionId}`);
      return;
    }

    const plan = await subscriptionPlanRepositories.getOne({
      id: userSubscription.planId,
    });

    if (!plan) {
      throw errorUtilities.createError(
        "Subscription plan not found",
        StatusCodes.NotFound,
      );
    }

    // Create failed transaction record
    const transactionData = {
      id: v4(),
      userId: userSubscription.userId,
      paymentGateway: PaymentGateway.STRIPE,
      gatewayTransactionId: invoice.id,
      gatewayCustomerId: invoice.customer,
      gatewaySubscriptionId: subscriptionId,
      transactionType: TransactionType.RENEWAL,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      status: TransactionStatus.FAILED,
      planType: plan.planType,
      planId: userSubscription.planId,
      description: `Failed ${plan.planType} renewal payment`,
      metadata: {
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: subscriptionId,
        attemptCount: invoice.attempt_count,
        nextPaymentAttempt: invoice.next_payment_attempt,
        failureReason:
          invoice.last_finalization_error?.message || "Payment failed",
      },
    };

    await transactionsRepositories.create(transactionData);

    // Update subscription status to PAYMENT_FAILED (but don't cancel yet - Stripe will retry)
    await userSubscriptionRepositories.updateOne(
      { id: userSubscription.id },
      {
        status: SubscriptionStatus.FAILED,
        metadata: {
          lastPaymentFailure: new Date(),
          paymentRetryCount: invoice.attempt_count,
        },
      },
    );

    // Send payment failure notification to user
    // await emailService.sendPaymentFailedEmail(userSubscription.userId, {
    //   amount: invoice.amount_due / 100,
    //   nextAttempt: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null,
    // });

    console.log(
      `Payment failed for subscription: ${subscriptionId}, attempt: ${invoice.attempt_count}`,
    );

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Payment failure processed",
      transactionData,
    );
  },
);

// Optional: Handle upcoming renewal notification
const handleUpcomingInvoice = errorUtilities.withServiceErrorHandling(
  async (invoice: any) => {
    console.log("Processing invoice.upcoming:", invoice.id);

    const subscriptionId = invoice.subscription;

    const userSubscription = await userSubscriptionRepositories.getOne({
      gatewaySubscriptionId: subscriptionId,
    });

    if (!userSubscription) {
      console.warn(`Subscription not found for: ${subscriptionId}`);
      return;
    }

    // Send renewal reminder email to user
    // await emailService.sendRenewalReminderEmail(userSubscription.userId, {
    //   amount: invoice.amount_due / 100,
    //   renewalDate: new Date(invoice.period_end * 1000),
    //   planType: userSubscription.planType,
    // });

    console.log(`Renewal reminder sent for subscription: ${subscriptionId}`);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Renewal reminder processed",
      null,
    );
  },
);

const cancelUserSubscription = errorUtilities.withServiceErrorHandling(
  async (
    userId: string,
    subscriptionId: string,
    cancelImmediately: boolean = false,
  ) => {
    // Get the user's subscription from your database
    const userSubscription = await userSubscriptionRepositories.getOne({
      id: subscriptionId,
      userId: userId,
      status: SubscriptionStatus.ACTIVE,
    });

    if (!userSubscription) {
      throw errorUtilities.createError(
        "Active subscription not found",
        StatusCodes.NotFound,
      );
    }

    if (!userSubscription.gatewaySubscriptionId) {
      throw errorUtilities.createError(
        "Stripe subscription ID not found",
        StatusCodes.BadRequest,
      );
    }

    try {
      if (cancelImmediately) {
        // Cancel immediately - user loses access right away
        const canceledSubscription = await stripe.subscriptions.cancel(
          userSubscription.gatewaySubscriptionId,
        );

        // Update in your database
        await userSubscriptionRepositories.updateOne(
          { id: userSubscription.id },
          {
            status: SubscriptionStatus.CANCELLED,
            endDate: new Date(),
            cancelledAt: new Date(),
            metadata: {
              cancellationReason: "user_requested",
              cancelledBy: "user",
              cancelledImmediately: true,
            },
          },
        );

        console.log(
          `Subscription cancelled immediately: ${userSubscription.gatewaySubscriptionId}`,
        );
      } else {
        // Cancel at period end - user keeps access until renewal date
        const updatedSubscription = await stripe.subscriptions.update(
          userSubscription.gatewaySubscriptionId,
          {
            cancel_at_period_end: true,
          },
        );

        // Update in your database
        await userSubscriptionRepositories.updateOne(
          { id: userSubscription.id },
          {
            status: SubscriptionStatus.CANCELLING, // New status: active but won't renew
            cancelledAt: new Date(),
            metadata: {
              cancellationReason: "user_requested",
              cancelledBy: "user",
              cancelAtPeriodEnd: true,
              // periodEnd: new Date(updatedSubscription.current_period_end * 1000),
            },
          },
        );

        console.log(
          `Subscription will cancel at period end: ${userSubscription.endDate}`,
        );
      }

      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Subscription cancelled successfully",
        {
          subscriptionId: userSubscription.id,
          cancelledImmediately: cancelImmediately,
          accessUntil: cancelImmediately
            ? new Date()
            : userSubscription.endDate,
        },
      );
    } catch (error: any) {
      console.error("Stripe cancellation error:", error);
      throw errorUtilities.createError(
        `Failed to cancel subscription: ${error.message}`,
        StatusCodes.InternalServerError,
      );
    }
  },
);

// Reactivate a subscription (if user changes their mind before period end)
const reactivateUserSubscription = errorUtilities.withServiceErrorHandling(
  async (userId: string, subscriptionId: string) => {
    const userSubscription = await userSubscriptionRepositories.getOne({
      id: subscriptionId,
      userId: userId,
      status: SubscriptionStatus.CANCELLING,
    });

    if (!userSubscription) {
      throw errorUtilities.createError(
        "Cancelling subscription not found",
        StatusCodes.NotFound,
      );
    }

    if (!userSubscription.gatewaySubscriptionId) {
      throw errorUtilities.createError(
        "Stripe subscription ID not found",
        StatusCodes.BadRequest,
      );
    }

    try {
      // Reactivate in Stripe
      const reactivatedSubscription = await stripe.subscriptions.update(
        userSubscription.gatewaySubscriptionId,
        {
          cancel_at_period_end: false,
        },
      );

      // Update in your database
      await userSubscriptionRepositories.updateOne(
        { id: userSubscription.id },
        {
          status: SubscriptionStatus.ACTIVE,
          cancelledAt: null,
          metadata: {
            reactivatedAt: new Date(),
            cancelAtPeriodEnd: false,
          },
        },
      );

      console.log(
        `Subscription reactivated: ${userSubscription.gatewaySubscriptionId}`,
      );

      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Subscription reactivated successfully",
        {
          subscriptionId: userSubscription.id,
          renewalDate: userSubscription.renewalDate,
        },
      );
    } catch (error: any) {
      console.error("Stripe reactivation error:", error);
      throw errorUtilities.createError(
        `Failed to reactivate subscription: ${error.message}`,
        StatusCodes.InternalServerError,
      );
    }
  },
);

export default {
  createCheckoutSession,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleCheckoutSessionCompleted,
  handleInvoicePaymentFailed,
  handleUpcomingInvoice,
  reactivateUserSubscription,
  cancelUserSubscription,
};
