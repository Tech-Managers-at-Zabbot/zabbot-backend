import subscriptionPlanRepositories from "../../repositories/subscriptionRepositories/subscription.repositories";
import { PlanType } from "../../../../shared/entities/payment-service-entities/subscriptions/subscriptions";
import { v4 } from "uuid";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";

const createSubscriptionService = errorUtilities.withServiceErrorHandling(
  async (payload: any) => {
    let billingCycleMonths: number | null = null;

    switch (payload.planType) {
      case PlanType.MONTHLY:
        billingCycleMonths = 1;
        break;

      case PlanType.ANNUAL:
        billingCycleMonths = 12;
        break;

      case PlanType.LIFETIME:
        billingCycleMonths = null;
        break;

      default:
        console.warn(`Invalid plan type: ${payload.planType}`);
        return;
    }

    const existingPlan = await subscriptionPlanRepositories.getOne({
      planType: payload.planType,
    });

    if (existingPlan) {
      throw errorUtilities.createError(
        `Plan with plan ${payload.planType} already exists`,
        400
      );
    }

    const newPlan = await subscriptionPlanRepositories.create({
      id: v4(),
      planType: payload.planType,
      price: payload.price,
      currency: payload.currency || "USD",
      billingCycleMonths,
      features: payload.features || {},
    });

    console.log(`Created subscription plan: ${newPlan.id}`);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Process successful",
      newPlan
    );
  }
);

export default { createSubscriptionService };
