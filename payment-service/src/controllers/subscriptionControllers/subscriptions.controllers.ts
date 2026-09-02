import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import subscriptionServices from "../../services/subscriptionService/subscription.services";
import { userSubscriptionService } from "../../services";

const createSubscriptionController = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const serviceResponse =
      await subscriptionServices.createSubscriptionService(request.body);

    return responseUtilities.responseHandler(
      response,
      serviceResponse.message,
      serviceResponse.statusCode,
      serviceResponse.data
    );
  }
);

const getUserSubscriptionController = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const { userId } = request.user
    const serviceResponse = await userSubscriptionService.getUserSubscriptionService(userId)
     return responseUtilities.responseHandler(
      response,
      serviceResponse.message,
      serviceResponse.statusCode,
      serviceResponse.data
    );
  })

export default {
  createSubscriptionController,
  getUserSubscriptionController,
};
