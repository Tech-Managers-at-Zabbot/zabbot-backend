import { userNotificationServices } from "../../services";
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";

const upsertUserNotificationController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;
      const {
        dailyReminders,
        weeklyReminders,
        biWeeklyReminders,
        noNotificationsAndReminders,
      } = request.body;

      const newUserNotification =
        await userNotificationServices.upsertUserNotificationService(userId, {
          dailyReminders,
          weeklyReminders,
          biWeeklyReminders,
          noNotificationsAndReminders,
        });

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


  const getUserNotificationSettingForCronJobController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.query;
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
  getUserNotificationSettingForCronJobController
};
