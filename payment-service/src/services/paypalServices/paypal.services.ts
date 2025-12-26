import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { PaymentOptions } from "../../types/payment.types";
import { paypalClient } from "../../config/paypal.config";
import config from "../../../../config/config";
import {
  PaymentGateway,
  TransactionStatus,
  TransactionType,
} from "../../../../shared/entities/payment-service-entities/transactions/transactions";
import { SubscriptionStatus } from "../../../../shared/entities/payment-service-entities/subscriptions/userSubscriptions";
import { v4 } from "uuid";
import transactionsRepositories from "../../repositories/transationRepositories/transaction.repositories";
import { userSubscriptionService } from "../index";
import userSubscriptionRepositories from "../../repositories/userSubscirptionRepositories/userSubscription.repositories";
import subscriptionPlanRepositories from "../../repositories/subscriptionRepositories/subscription.repositories";
import paypal from "@paypal/checkout-server-sdk";
import axios from "axios";

// Get PayPal access token
const getPayPalAccessToken = async (): Promise<string> => {
  const auth = Buffer.from(
    `${config.PAYPAL_CLIENT_ID}:${config.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    `${config.NODE_ENV === "production" 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com"}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};

const createPayPalOrder = errorUtilities.withServiceErrorHandling(
  async (subscriptionType: string, userId: string) => {
    const plan = await subscriptionPlanRepositories.getOne({
      planType: subscriptionType,
    });

    if (!plan) {
      throw errorUtilities.createError(
        "Subscription plan not found",
        StatusCodes.NotFound
      );
    }

    let planId: string;
    let isSubscription = true;

    // Map to PayPal plan IDs
    switch (subscriptionType) {
      case PaymentOptions.MONTHLY_SUBSCRIPTION:
        planId = config.PAYPAL_MONTHLY_PLAN_ID || "";
        break;
      case PaymentOptions.ANNUAL_SUBSCRIPTION:
        planId = config.PAYPAL_ANNUAL_PLAN_ID || "";
        break;
      case PaymentOptions.LIFETIME_SUBSCRIPTION:
        planId = config.PAYPAL_LIFETIME_PLAN_ID || "";
        isSubscription = false; // One-time payment
        break;
      default:
        throw errorUtilities.createError(
          "Invalid subscription type",
          StatusCodes.BadRequest
        );
    }

    if (isSubscription) {
      // Create subscription using REST API
      const accessToken = await getPayPalAccessToken();
      
      const baseUrl = config.NODE_ENV === "production" 
        ? "https://api-m.paypal.com" 
        : "https://api-m.sandbox.paypal.com";

      const response = await axios.post(
        `${baseUrl}/v1/billing/subscriptions`,
        {
          plan_id: planId,
          application_context: {
            brand_name: "Your App Name",
            user_action: "SUBSCRIBE_NOW",
            return_url: `${config.PAYPAL_SUCCESS_URL}?type=${subscriptionType}`,
            cancel_url: `${config.PAYPAL_CANCEL_URL}?type=${subscriptionType}`,
          },
          custom_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Create pending transaction
      const transactionData = {
        id: v4(),
        userId,
        paymentGateway: PaymentGateway.PAYPAL,
        gatewayTransactionId: response.data.id,
        transactionType: TransactionType.SUBSCRIPTION,
        amount: plan.price,
        currency: plan.currency,
        status: TransactionStatus.PENDING,
        planType: plan.planType,
        planId: plan.id,
        description: `${plan.planType} subscription payment`,
        metadata: {
          subscriptionId: response.data.id,
          planName: plan.planType,
        },
      };

      await transactionsRepositories.create(transactionData);

      // Get approval URL
      const approvalUrl = response.data.links?.find(
        (link: any) => link.rel === "approve"
      )?.href;

      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "PayPal order created successfully",
        {
          subscriptionId: response.data.id,
          approvalUrl,
          transactionId: transactionData.id,
        }
      );
    } else {
      // One-time payment for lifetime using Orders API
      const request = new paypal.orders.OrdersCreateRequest();
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: plan.currency,
              value: plan.price.toFixed(2),
            },
            description: `${plan.planType} - Lifetime Access`,
            custom_id: userId,
          },
        ],
        application_context: {
          brand_name: "Your App Name",
          user_action: "PAY_NOW",
          return_url: `${config.PAYPAL_SUCCESS_URL}?type=${subscriptionType}`,
          cancel_url: `${config.PAYPAL_CANCEL_URL}?type=${subscriptionType}`,
        },
      });

      const response = await paypalClient().execute(request);

      const transactionData = {
        id: v4(),
        userId,
        paymentGateway: PaymentGateway.PAYPAL,
        gatewayTransactionId: response.result.id,
        transactionType: TransactionType.SUBSCRIPTION,
        amount: plan.price,
        currency: plan.currency,
        status: TransactionStatus.PENDING,
        planType: plan.planType,
        planId: plan.id,
        description: `${plan.planType} one-time payment`,
        metadata: {
          orderId: response.result.id,
          planName: plan.planType,
        },
      };

      await transactionsRepositories.create(transactionData);

      const approvalUrl = response.result.links?.find(
        (link: any) => link.rel === "approve"
      )?.href;

      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "PayPal order created successfully",
        {
          orderId: response.result.id,
          approvalUrl,
          transactionId: transactionData.id,
        }
      );
    }
  }
);

const capturePayPalOrder = errorUtilities.withServiceErrorHandling(
  async (orderId: string) => {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const response = await paypalClient().execute(request);

    const transaction = await transactionsRepositories.getOne({
      gatewayTransactionId: orderId,
      paymentGateway: PaymentGateway.PAYPAL,
    });

    if (!transaction) {
      throw errorUtilities.createError(
        "Transaction not found",
        StatusCodes.NotFound
      );
    }

    await transactionsRepositories.updateOne(
      { gatewayTransactionId: orderId },
      {
        status: TransactionStatus.SUCCESS,
        paidAt: new Date(),
        paymentMethod: "paypal",
        gatewaySubscriptionId: response.result.id,
        metadata: {
          ...transaction.metadata,
          captureDetails: response.result,
        },
      }
    );

    if (transaction.transactionType === TransactionType.SUBSCRIPTION) {
      await userSubscriptionService.createOrUpdateUserSubscription(transaction);
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Payment captured successfully",
      response.result
    );
  }
);

const handlePayPalWebhook = errorUtilities.withServiceErrorHandling(
  async (eventType: string, resource: any) => {
    console.log(`Processing PayPal webhook: ${eventType}`);

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(resource);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancelled(resource);
        break;

      case "PAYMENT.SALE.COMPLETED":
        await handlePaymentCompleted(resource);
        break;

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        await handlePaymentFailed(resource);
        break;

      case "BILLING.SUBSCRIPTION.UPDATED":
        console.log("Subscription updated:", resource);
        break;

      default:
        console.log(`Unhandled PayPal event: ${eventType}`);
    }
  }
);

const handleSubscriptionActivated = async (subscription: any) => {
  console.log("Processing BILLING.SUBSCRIPTION.ACTIVATED:", subscription.id);

  const transaction = await transactionsRepositories.getOne({
    gatewayTransactionId: subscription.id,
    paymentGateway: PaymentGateway.PAYPAL,
  });

  if (transaction) {
    await transactionsRepositories.updateOne(
      { id: transaction.id },
      {
        status: TransactionStatus.SUCCESS,
        paidAt: new Date(),
        gatewaySubscriptionId: subscription.id,
        gatewayCustomerId: subscription.subscriber?.email_address || null,
        metadata: {
          ...transaction.metadata,
          subscriptionDetails: subscription,
        },
      }
    );

    await userSubscriptionService.createOrUpdateUserSubscription(transaction);
    console.log(`Subscription activated for transaction: ${transaction.id}`);
  }
};

const handleSubscriptionCancelled = async (subscription: any) => {
  console.log("Processing BILLING.SUBSCRIPTION.CANCELLED:", subscription.id);

  const userSubscription = await userSubscriptionRepositories.getOne({
    gatewaySubscriptionId: subscription.id,
  });

  if (userSubscription) {
    await userSubscriptionRepositories.updateOne(
      { id: userSubscription.id },
      {
        status: SubscriptionStatus.CANCELLED,
        endDate: new Date(),
        cancelledAt: new Date(),
        metadata: {
          ...userSubscription,
          cancellationReason: "paypal_cancelled",
        },
      }
    );
    console.log(`Subscription cancelled: ${subscription.id}`);
  }
};

const handlePaymentCompleted = async (payment: any) => {
  console.log("Processing PAYMENT.SALE.COMPLETED:", payment.id);

  // This handles renewal payments
  const billingAgreementId = payment.billing_agreement_id;

  if (!billingAgreementId) {
    console.log("No billing agreement ID found, skipping...");
    return;
  }

  const userSubscription = await userSubscriptionRepositories.getOne({
    gatewaySubscriptionId: billingAgreementId,
    status: SubscriptionStatus.ACTIVE,
  });

  if (!userSubscription) {
    console.warn(`Active subscription not found for: ${billingAgreementId}`);
    return;
  }

  const plan = await subscriptionPlanRepositories.getOne({
    id: userSubscription.planId,
  });

  if (!plan) {
    console.warn("Plan not found");
    return;
  }

  // Create renewal transaction
  const transactionData = {
    id: v4(),
    userId: userSubscription.userId,
    paymentGateway: PaymentGateway.PAYPAL,
    gatewayTransactionId: payment.id,
    gatewaySubscriptionId: billingAgreementId,
    transactionType: TransactionType.RENEWAL,
    amount: parseFloat(payment.amount.total),
    currency: payment.amount.currency,
    status: TransactionStatus.SUCCESS,
    planType: plan.planType,
    planId: userSubscription.planId,
    paidAt: new Date(payment.create_time),
    paymentMethod: "paypal",
    description: `${plan.planType} subscription renewal`,
    metadata: {
      paypalSaleId: payment.id,
      billingAgreementId,
    },
  };

  const transaction = await transactionsRepositories.create(transactionData);
  await userSubscriptionService.createOrUpdateUserSubscription(transaction);

  console.log(`Renewal payment completed for transaction: ${transaction.id}`);
};

const handlePaymentFailed = async (payment: any) => {
  console.log("Processing BILLING.SUBSCRIPTION.PAYMENT.FAILED:", payment.id);

  const userSubscription = await userSubscriptionRepositories.getOne({
    gatewaySubscriptionId: payment.id,
  });

  if (userSubscription) {
    await userSubscriptionRepositories.updateOne(
      { id: userSubscription.id },
      {
        status: SubscriptionStatus.FAILED,
        metadata: {
          ...userSubscription,
          lastPaymentFailure: new Date(),
        },
      }
    );
    console.log(`Payment failed for subscription: ${payment.id}`);
  }
};

const cancelPayPalSubscription = errorUtilities.withServiceErrorHandling(
  async (userId: string, subscriptionId: string, reason: string = "User requested cancellation") => {
    const userSubscription = await userSubscriptionRepositories.getOne({
      id: subscriptionId,
      userId,
      status: SubscriptionStatus.ACTIVE,
    });

    if (!userSubscription || !userSubscription.gatewaySubscriptionId) {
      throw errorUtilities.createError(
        "Active subscription not found",
        StatusCodes.NotFound
      );
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = config.NODE_ENV === "production" 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com";

    await axios.post(
      `${baseUrl}/v1/billing/subscriptions/${userSubscription.gatewaySubscriptionId}/cancel`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    await userSubscriptionRepositories.updateOne(
      { id: userSubscription.id },
      {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        endDate: new Date(),
        metadata: {
          ...userSubscription,
          cancellationReason: reason,
          cancelledBy: "user",
        },
      }
    );

    console.log(`Subscription cancelled: ${userSubscription.gatewaySubscriptionId}`);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Subscription cancelled successfully",
      { subscriptionId: userSubscription.id }
    );
  }
);

export default {
  createPayPalOrder,
  capturePayPalOrder,
  handlePayPalWebhook,
  cancelPayPalSubscription,
};