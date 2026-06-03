import newsletterSubscriptionRepositories from "../../repositories/newsletterSubscriptionRepositories/newsletterSubscription.repositories";
import {
  responseUtilities,
  errorUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";

const createNewsletterSubscriptionService =
  errorUtilities.withServiceErrorHandling(async (email: string) => {
    const existing = await newsletterSubscriptionRepositories.getOne({ email });
    if (existing) {
      throw errorUtilities.createError(
        "Subscription already exists",
        StatusCodes.Conflict,
      );
    }

    const newSubscription = await newsletterSubscriptionRepositories.create({
      email,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.Created,
      "Newsletter subscription created successfully",
      newSubscription,
    );
  });

const deleteNewsletterSubscriptionService =
  errorUtilities.withServiceErrorHandling(async (email: string) => {
    const existing = await newsletterSubscriptionRepositories.getOne({ email });
    if (!existing) {
      throw errorUtilities.createError(
        "Subscription not found",
        StatusCodes.NotFound,
      );
    }

    await newsletterSubscriptionRepositories.deleteOne({ email });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Newsletter subscription deleted successfully",
      existing,
    );
  });

export default {
  createNewsletterSubscriptionService,
  deleteNewsletterSubscriptionService,
};
