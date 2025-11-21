import { stripeServices } from "../../services";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { Request, Response } from "express";
import { helpersUtilities } from "../../../../shared/utilities";

const createCheckoutSessionController =
  errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
      const { subscriptionType } = request.body;
      const serviceResponse = await stripeServices.createCheckoutSession(
        subscriptionType
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
};
