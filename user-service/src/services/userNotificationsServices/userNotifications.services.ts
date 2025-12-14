import {
  responseUtilities,
  errorUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { GeneralResponses } from "../../responses/generalResponses/general.responses";
import userNotificationsRepositories from "../../repositories/userNotificationRepositories/userNotification.repositories";
import { v4 } from "uuid";
import { NotificationFrequency } from "../../../../shared/entities/user-service-entities/userNotificationSettings/userNotificationSettings.entities";
import { NotificationResponses } from "../../responses/userNotifcationsResponses/userNotifications.responses";
import { endpointCallsUtilities } from "../../utilities";
import config from "../../../../config/config";
import userRepositories from "../../repositories/userRepositories/users.repositories";

const upsertUserNotificationService = errorUtilities.withServiceErrorHandling(
  async (userId: string, frequency?: string) => {
    const user = await userRepositories.getOne({ id: userId });

    if (!user) {
      throw errorUtilities.createError(
        GeneralResponses.USER_NOT_FOUND,
        StatusCodes.NotFound
      );
    }
    const existing = await userNotificationsRepositories.getOne({ userId });

    if (existing) {
      const updated = await userNotificationsRepositories.updateOne(
        { userId },
        {
          frequency: frequency || existing.frequency,
        }
      );

      const emailData = {
        email: user.email,
        firstName: user.firstName,
        notificationPreference: frequency || existing.frequency,
      };
      const emailPayload = {
        url: `${config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/notification-preference-change`,
        emailData,
      };

      endpointCallsUtilities
        .processEmailsInBackground(emailPayload)
        .catch((error) => {
          console.error(
            `Background email processing failed for ${user.email}:`,
            error.message
          );
        });
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        GeneralResponses.PROCESS_SUCCESSFUL,
        { notification: updated }
      );
    }

    const newRecord = await userNotificationsRepositories.create({
      id: v4(),
      userId,
      frequency: frequency || NotificationFrequency.WEEKLY,
    });

    if (!newRecord) {
      throw errorUtilities.createError(
        NotificationResponses.UNSUCCESSFUL_PROCESS,
        StatusCodes.InternalServerError
      );
    }

    const emailData = {
      email: user.email,
      firstName: user.firstName,
      notificationPreference: frequency || newRecord.frequency,
    };
    const emailPayload = {
      url: `${config.NOTIFICATION_SERVICE_ROUTE}/auth-notification/notification-preference-change`,
      emailData,
    };

    endpointCallsUtilities
      .processEmailsInBackground(emailPayload)
      .catch((error) => {
        console.error(
          `Background email processing failed for ${user.email}:`,
          error.message
        );
      });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      NotificationResponses.SUCCESSFUL_PROCESS,
      { notification: newRecord }
    );
  }
);

const getUserNotificationSettingService =
  errorUtilities.withServiceErrorHandling(async (userId: string) => {
    const existing = await userNotificationsRepositories.getOne({ userId });

    if (!existing) {
      const newRecord = await userNotificationsRepositories.create({
        id: v4(),
        userId,
        frequency: NotificationFrequency.WEEKLY,
      });

      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        NotificationResponses.SUCCESSFUL_PROCESS,
        { notification: newRecord }
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      NotificationResponses.SUCCESSFUL_PROCESS,
      { notification: existing }
    );
  });

export default {
  upsertUserNotificationService,
  getUserNotificationSettingService,
};
