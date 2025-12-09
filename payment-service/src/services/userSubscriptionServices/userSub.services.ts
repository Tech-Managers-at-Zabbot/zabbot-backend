import subscriptionPlanRepositories from "../../repositories/subscriptionRepositories/subscription.repositories";
import { PlanType } from "../../../../shared/entities/payment-service-entities/subscriptions/subscriptions";
import { SubscriptionStatus } from "../../../../shared/entities/payment-service-entities/subscriptions/userSubscriptions";
import userSubscriptionRepositories from "../../repositories/userSubscirptionRepositories/userSubscription.repositories";
import { v4 } from "uuid";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { PaymentOptions } from "../../types/payment.types";
import { TransactionType } from "../../../../shared/entities/payment-service-entities/transactions/transactions";

const createOrUpdateUserSubscription = errorUtilities.withServiceErrorHandling(
  async (transaction: any) => {
    if (!transaction.planId) {
      console.warn(
        "No planId found in transaction, skipping subscription creation"
      );
      return;
    }

    const plan = await subscriptionPlanRepositories.getOne({
      id: transaction.planId,
    });

    if (!plan) {
      console.warn(`Subscription plan not found: ${transaction.planId}`);
      return;
    }

    const existingSubscription = await userSubscriptionRepositories.getOne({
      userId: transaction.userId,
      planId: transaction.planId,
      gatewaySubscriptionId: transaction.gatewaySubscriptionId,
      status: SubscriptionStatus.ACTIVE,
    });

    // TransactionType
    let startDate: Date = new Date();
    let endDate: Date | null = null;
    let renewalDate: Date | null = null;


     if (existingSubscription && transaction.transactionType === TransactionType.RENEWAL) {
      startDate = existingSubscription.endDate && existingSubscription.endDate > new Date()
        ? existingSubscription.endDate
        : new Date();
    } else {
      startDate = new Date();
    }

if (plan.planType !== PlanType.LIFETIME) {
  renewalDate = new Date(startDate);

  if (plan.planType === PlanType.MONTHLY) {
    const months = plan.billingCycleMonths || 1;
    renewalDate.setMonth(renewalDate.getMonth() + months);
  }

  else if (plan.planType === PlanType.ANNUAL) {
    const years = plan.billingCycleMonths || 12;
    renewalDate.setFullYear(renewalDate.getFullYear() + years);
  }

  endDate = new Date(renewalDate);
}


if (existingSubscription) {
      await userSubscriptionRepositories.updateOne(
        {
          userId: transaction.userId,
          planId: transaction.planId,
          gatewaySubscriptionId: transaction.gatewaySubscriptionId,
          status: SubscriptionStatus.ACTIVE,
        },
        {
          status: SubscriptionStatus.ACTIVE,
          startDate,
          renewalDate,
          endDate,
        }
      );

      console.log(`Updated subscription for user: ${transaction.userId}`);
    } else {
      await userSubscriptionRepositories.create({
        id: v4(),
        userId: transaction.userId,
        planId: transaction.planId,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        renewalDate,
        gatewaySubscriptionId: transaction.gatewaySubscriptionId,
      });

      console.log(`Created new subscription for user: ${transaction.userId}`);
    }
  }
);



const calculateEndDate = (startDate: Date, planType: string): Date => {
  const endDate = new Date(startDate);
  
  switch (planType) {
    case PaymentOptions.MONTHLY_SUBSCRIPTION:
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case PaymentOptions.ANNUAL_SUBSCRIPTION:
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    case PaymentOptions.LIFETIME_SUBSCRIPTION:
      endDate.setFullYear(endDate.getFullYear() + 100);
      break;
  }
  
  return endDate;
};

const getUserSubscriptionService = errorUtilities.withServiceErrorHandling(
  async (userId: string) => {
    const existingSubscription = await userSubscriptionRepositories.getOne({
      userId,
      status: SubscriptionStatus.ACTIVE,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Process successful",
      existingSubscription
    );
  }
);

export default {
  createOrUpdateUserSubscription,
  getUserSubscriptionService
};
