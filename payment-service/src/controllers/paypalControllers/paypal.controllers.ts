import { paypalServices } from "../../services";
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";

const createPayPalOrderController = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const { subscriptionType } = request.body;
    const { userId } = request.user;

    const serviceResponse = await paypalServices.createPayPalOrder(
      subscriptionType,
      userId
    );

    return responseUtilities.responseHandler(
      response,
      serviceResponse.message,
      serviceResponse.statusCode,
      serviceResponse.data
    );
  }
);

const capturePayPalOrderController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { orderId } = request.body;

    const serviceResponse = await paypalServices.capturePayPalOrder(orderId);

    return responseUtilities.responseHandler(
      response,
      serviceResponse.message,
      serviceResponse.statusCode,
      serviceResponse.data
    );
  }
);

const paypalWebhookController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { event_type, resource } = request.body;

    await paypalServices.handlePayPalWebhook(event_type, resource);

    return responseUtilities.responseHandler(
      response,
      "Webhook processed successfully",
      StatusCodes.OK
    );
  }
);

const cancelPayPalSubscriptionController = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const { subscriptionId } = request.params;
    const { reason } = request.body;
    const { userId } = request.user;

    const serviceResponse = await paypalServices.cancelPayPalSubscription(
      userId,
      subscriptionId,
      reason
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
  createPayPalOrderController,
  capturePayPalOrderController,
  paypalWebhookController,
  cancelPayPalSubscriptionController,
};