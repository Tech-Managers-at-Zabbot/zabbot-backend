import { userNotificationServices, userServices } from "../../services";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { Request, Response } from "express";
import { helpersUtilities } from "../../../../shared/utilities";
import { JwtPayload } from "jsonwebtoken";

const upsertUserNotificationController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;
      const { frequency } = request.body;

      const newUserNotification =
        await userNotificationServices.upsertUserNotificationService(
          userId,
          frequency
        );

      return responseUtilities.responseHandler(
        response,
        newUserNotification.message,
        newUserNotification.statusCode,
        newUserNotification.data
      );
    }
  );

const getUserNotificationSettingController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;
      const userNotification =
        await userNotificationServices.getUserNotificationSettingService(
          userId
        );

      return responseUtilities.responseHandler(
        response,
        userNotification.message,
        userNotification.statusCode,
        userNotification.data
      );
    }
  );

export default {
  upsertUserNotificationController,
  getUserNotificationSettingController,
};
