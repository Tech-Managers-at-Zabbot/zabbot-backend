import cron from "node-cron";
import { Op } from "sequelize";
import Stripe from "stripe";
import transactionsRepositories from "../payment-service/src/repositories/transationRepositories/transaction.repositories";
import userSubscriptionRepositories from "../payment-service/src/repositories/userSubscirptionRepositories/userSubscription.repositories";
import { stripe } from "../payment-service/src/config/stripe.config";
import {
  TransactionStatus,
  PlanType,
} from "../shared/entities/payment-service-entities/transactions/transactions";
import { SubscriptionStatus } from "../shared/entities/payment-service-entities/subscriptions/userSubscriptions";
import Users from "../shared/entities/user-service-entities/users/users.entities";
import { sendgridMailServices } from "../notification-service/src/services";

const MAX_CHARGE_ATTEMPTS = 3;
const RETRY_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Charges lifetime-plan trial transactions whose 7-day free trial has ended,
// using the payment method saved via the SetupIntent at checkout time.
const processDueLifetimeCharges = async () => {
  try {
    console.log(
      "💳 Starting delayed lifetime charge processing at:",
      new Date().toISOString()
    );

    const dueTransactions = await transactionsRepositories.getMany({
      status: TransactionStatus.TRIALING,
      planType: PlanType.LIFETIME,
      scheduledChargeAt: { [Op.lte]: new Date() },
    });

    if (!dueTransactions || dueTransactions.length === 0) {
      console.log("✅ No lifetime trial charges due");
      return;
    }

    console.log(`💳 Found ${dueTransactions.length} lifetime trial charge(s) due`);

    for (const transaction of dueTransactions) {
      try {
        await chargeTransaction(transaction);
      } catch (error: any) {
        console.error(
          `❌ Error processing delayed charge for transaction ${transaction.id}:`,
          error.message
        );
      }
    }
  } catch (error: any) {
    console.error("❌ Error in lifetime trial charge cron job:", error.message);
  }
};

const chargeTransaction = async (transaction: any) => {
  // Concurrency guard: claim the transaction before calling Stripe so an
  // overlapping run (or a slow prior run) can't charge it twice.
  await transactionsRepositories.updateOne(
    { id: transaction.id, status: TransactionStatus.TRIALING },
    { status: TransactionStatus.PROCESSING }
  );

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(transaction.amount) * 100),
      currency: transaction.currency.toLowerCase(),
      customer: transaction.gatewayCustomerId,
      payment_method: transaction.paymentMethodId,
      off_session: true,
      confirm: true,
      description: "Lifetime plan trial conversion charge",
    });

    if (paymentIntent.status === "succeeded") {
      await handleChargeSuccess(transaction, paymentIntent);
    } else {
      // Off-session confirm normally throws rather than returning a non-succeeded
      // status, but handle it defensively - only treat "requires_action" as the
      // unrecoverable SCA case, anything else retries like an ordinary decline.
      await handleChargeFailure(transaction, {
        code:
          paymentIntent.status === "requires_action"
            ? "authentication_required"
            : "card_declined",
        message: `PaymentIntent ended in status: ${paymentIntent.status}`,
      });
    }
  } catch (error: any) {
    await handleChargeFailure(transaction, error);
  }
};

const handleChargeSuccess = async (
  transaction: any,
  paymentIntent: Stripe.PaymentIntent
) => {
  await transactionsRepositories.updateOne(
    { id: transaction.id },
    {
      status: TransactionStatus.SUCCESS,
      paidAt: new Date(),
      metadata: {
        ...transaction.metadata,
        chargePaymentIntentId: paymentIntent.id,
      },
    }
  );

  const userSubscription = await userSubscriptionRepositories.getOne({
    userId: transaction.userId,
    planId: transaction.planId,
    status: SubscriptionStatus.ACTIVE,
  });

  if (userSubscription) {
    await userSubscriptionRepositories.updateOne(
      { id: userSubscription.id },
      { trialEndsAt: null }
    );
  }

  console.log(`✅ Lifetime trial charge succeeded for transaction: ${transaction.id}`);
};

const handleChargeFailure = async (transaction: any, error: any) => {
  // An off-session charge can never complete without the customer actively
  // authenticating, so SCA is terminal immediately - no amount of retrying helps.
  const requiresAuthentication = error?.code === "authentication_required";
  const attempts = Number(transaction.chargeAttempts || 0) + 1;
  const isFinalAttempt = requiresAuthentication || attempts >= MAX_CHARGE_ATTEMPTS;

  if (isFinalAttempt) {
    await transactionsRepositories.updateOne(
      { id: transaction.id },
      {
        status: TransactionStatus.FAILED,
        failedAt: new Date(),
        failureReason: error?.message || "Payment failed",
        failureCode: error?.code || "unknown",
        chargeAttempts: attempts,
        metadata: {
          ...transaction.metadata,
          requiresAction: requiresAuthentication,
        },
      }
    );

    const userSubscription = await userSubscriptionRepositories.getOne({
      userId: transaction.userId,
      planId: transaction.planId,
      status: SubscriptionStatus.ACTIVE,
    });

    if (userSubscription) {
      await userSubscriptionRepositories.updateOne(
        { id: userSubscription.id },
        { status: SubscriptionStatus.FAILED }
      );
    }

    await sendFailureEmail(transaction);

    console.log(
      `❌ Lifetime trial charge permanently failed for transaction: ${transaction.id} ` +
        `(${requiresAuthentication ? "requires authentication" : `${attempts} attempts`})`
    );
  } else {
    await transactionsRepositories.updateOne(
      { id: transaction.id },
      {
        status: TransactionStatus.TRIALING,
        chargeAttempts: attempts,
        scheduledChargeAt: new Date(Date.now() + RETRY_INTERVAL_MS),
        failureReason: error?.message || "Payment failed",
        failureCode: error?.code || "unknown",
      }
    );

    console.log(
      `⚠️ Lifetime trial charge attempt ${attempts} failed for transaction: ${transaction.id}, retrying in 24h`
    );
  }
};

const sendFailureEmail = async (transaction: any) => {
  try {
    const user = await Users.findByPk(transaction.userId);
    if (!user) return;

    await sendgridMailServices.sendPaymentFailedEmailService(
      user.email,
      user.firstName,
      transaction.planType,
      `${transaction.currency} ${Number(transaction.amount).toFixed(2)}`
    );
  } catch (error: any) {
    console.error(
      `Failed to send payment-failed email for transaction ${transaction.id}:`,
      error.message
    );
  }
};

export const startLifetimeTrialChargeCron = () => {
  // Run hourly, so the initial trial-end charge is attempted promptly.
  cron.schedule("0 * * * *", processDueLifetimeCharges);
  console.log("✅ Lifetime trial charge cron job scheduled to run hourly");
};

// For testing: run immediately
export const testLifetimeTrialChargeCron = async () => {
  console.log("🧪 Running lifetime trial charge cron job manually for testing...");
  await processDueLifetimeCharges();
};

export default {
  startLifetimeTrialChargeCron,
  testLifetimeTrialChargeCron,
  processDueLifetimeCharges,
};
