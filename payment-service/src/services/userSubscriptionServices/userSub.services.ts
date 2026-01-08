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
import Users from "../../../../shared/entities/user-service-entities/users/users.entities";

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

    const { userId } = transaction;
    const user = await Users.findByPk(userId);

    if (!user) {
      console.warn(`User not found: ${userId}`);
      return;
    }

    // Check if user has ANY active subscription (regardless of plan)
    const anyActiveSubscription = await userSubscriptionRepositories.getOne({
      userId: transaction.userId,
      status: SubscriptionStatus.ACTIVE,
    });

    // Check if user is changing plans
    const isDifferentPlan =
      anyActiveSubscription &&
      anyActiveSubscription.planId !== transaction.planId;

    // Check if this is a first-time subscriber (no subscriptions ever)
    const isFirstTimeSubscriber = Number(user.noOfSubscriptions) === 0;

    // Variable to track when the new plan should start
    let newPlanStartDate: Date = new Date();

    // Handle plan change: cancel old subscription and schedule new plan
    if (isDifferentPlan) {
      // Get the end date of the old plan to start the new one
      const oldPlanEndDate = anyActiveSubscription.endDate;

      // If old plan has a future end date, new plan starts then
      if (oldPlanEndDate && oldPlanEndDate > new Date()) {
        newPlanStartDate = new Date(oldPlanEndDate);
      }

      await userSubscriptionRepositories.updateOne(
        {
          id: anyActiveSubscription.id,
        },
        {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: "Plan change",
        }
      );

      console.log(
        `Cancelled previous subscription for plan change: ${anyActiveSubscription.id}. ` +
          `New plan will start on: ${newPlanStartDate.toISOString()}`
      );
    }

    // Check for existing subscription with same plan and gateway ID
    const existingSubscription = await userSubscriptionRepositories.getOne({
      userId: transaction.userId,
      planId: transaction.planId,
      gatewaySubscriptionId: transaction.gatewaySubscriptionId,
      status: SubscriptionStatus.ACTIVE,
    });

    // Calculate dates
    let startDate: Date;
    let endDate: Date | null = null;
    let renewalDate: Date | null = null;

    // For renewals, start from existing end date if it's in the future
    if (
      existingSubscription &&
      transaction.transactionType === TransactionType.RENEWAL
    ) {
      startDate =
        existingSubscription.endDate &&
        existingSubscription.endDate > new Date()
          ? existingSubscription.endDate
          : new Date();
    } else if (isDifferentPlan) {
      // For plan changes, use the calculated start date
      startDate = newPlanStartDate;
    } else {
      startDate = new Date();
    }

    // Calculate end and renewal dates based on plan type
    if (plan.planType !== PlanType.LIFETIME) {
      renewalDate = new Date(startDate);

      if (plan.planType === PlanType.MONTHLY) {
        const months = plan.billingCycleMonths || 1;
        renewalDate.setMonth(renewalDate.getMonth() + months);
      } else if (plan.planType === PlanType.ANNUAL) {
        const years = plan.billingCycleMonths
          ? plan.billingCycleMonths / 12
          : 1;
        renewalDate.setFullYear(renewalDate.getFullYear() + years);
      }

      endDate = new Date(renewalDate);

      // Add 7-day free trial for first-time subscribers
      // Only apply if the subscription starts now or in the past (not scheduled for future)
      if (isFirstTimeSubscriber && startDate <= new Date()) {
        endDate.setDate(endDate.getDate() + 7);
        if (renewalDate) {
          renewalDate.setDate(renewalDate.getDate() + 7);
        }
        console.log(
          `Applied 7-day free trial for first-time subscriber: ${userId}`
        );
      }
    }

    // Update or create subscription
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

      // Increment user's subscription count
      await Users.update(
        {
          noOfSubscriptions: Number(user.noOfSubscriptions || "0") + 1,
        },
        { where: { id: userId } }
      );

      console.log(
        `Created new subscription for user: ${transaction.userId}. ` +
          `Start: ${startDate.toISOString()}, End: ${
            endDate?.toISOString() || "Lifetime"
          }`
      );
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
  getUserSubscriptionService,
};
