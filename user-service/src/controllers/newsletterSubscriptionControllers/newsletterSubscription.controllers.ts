import { Request, Response } from "express";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { newsletterSubscriptionServices } from "../../services";

const createNewsletterSubscriptionController =
  errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
      const { email } = request.body;

      const result =
        await newsletterSubscriptionServices.createNewsletterSubscriptionService(
          email,
        );

      return responseUtilities.responseHandler(
        response,
        result.message,
        result.statusCode,
        result.data,
      );
    },
  );

const deleteNewsletterSubscriptionController =
  errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
      const { email } = request.body;

      const result =
        await newsletterSubscriptionServices.deleteNewsletterSubscriptionService(
          email,
        );

      return responseUtilities.responseHandler(
        response,
        result.message,
        result.statusCode,
        result.data,
      );
    },
  );

export default {
  createNewsletterSubscriptionController,
  deleteNewsletterSubscriptionController,
};
