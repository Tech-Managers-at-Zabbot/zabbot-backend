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

const createCheckoutSession = errorUtilities.withServiceErrorHandling(
  async (subscriptionType: string) => {
    let priceId: string;
    let paymentMode: string = "subscription";

    switch (subscriptionType) {
      case PaymentOptions.MONTHLY_SUBSCRIPTION:
        priceId = process.env.MONTHLY_SUBSCRIPTION_PRICE_ID || "";
        break;
      case PaymentOptions.ANNUAL_SUBSCRIPTION:
        priceId = process.env.ANNUAL_SUBSCRIPTION_PRICE_ID || "";
        break;
      case PaymentOptions.LIFETIME_SUBSCRIPTION:
        priceId = process.env.LIFTIME_SUBSCRIPTION_PRICE_ID || "";
        paymentMode = "payment";
        break;
      default:
        throw errorUtilities.createError(
          StripeResponses.INVALID_SUBSCRIPTION_TYPE,
          StatusCodes.BadRequest
        );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: paymentMode as "subscription" | "payment",
      success_url: `${config.STRIPE_SUCCESS_URL}?type=${subscriptionType}`,
      cancel_url: `${config.STRIPE_FAILURE_URL}?type=${subscriptionType}`,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      StripeResponses.PROCESS_SUCCESSFUL,
      { sessionId: session.id, sessionUrl: session.url }
    );
  }
);



export default {
  createCheckoutSession,
};
