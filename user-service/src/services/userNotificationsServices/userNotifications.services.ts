import {
  responseUtilities,
  errorUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { GeneralResponses } from "../../responses/generalResponses/general.responses";
import userNotificationsRepositories from "../../../../shared/repositories/userNotification.repositories";
import { v4 } from "uuid";
import { NotificationFrequency } from "../../../../shared/entities/user-service-entities/userNotificationSettings/userNotificationSettings.entities";
import { NotificationResponses } from "../../responses/userNotifcationsResponses/userNotifications.responses";
import { endpointCallsUtilities } from "../../utilities";
import config from "../../../../config/config";
import userRepositories from "../../repositories/userRepositories/users.repositories";
import { Op } from "sequelize";

export const calculateNextNotificationDate = (frequency: NotificationFrequency): Date | null => {
  if (frequency === NotificationFrequency.NEVER) {
    return null;
  }

 const now = new Date();
  const nextDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
  
  // First, set to midnight of current day
  nextDate.setHours(0, 0, 0, 0);

  // Then add the days
  switch (frequency) {
    case NotificationFrequency.DAILY:
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case NotificationFrequency.WEEKLY:
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case NotificationFrequency.BIWEEKLY:
      nextDate.setDate(nextDate.getDate() + 14);
      break;
  }

  return nextDate;
};

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
      const updatedFrequency = (frequency ||
        existing.frequency) as NotificationFrequency;
      const now = new Date();

      const updated = await userNotificationsRepositories.updateOne(
        { userId },
        {
          frequency: updatedFrequency,
          lastNotificationDate: now,
          nextNotificationDate: calculateNextNotificationDate(updatedFrequency),
        }
      );

      const emailData = {
        email: user.email,
        firstName: user.firstName,
        notificationPreference: updatedFrequency,
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

    const newFrequency = (frequency ||
      NotificationFrequency.WEEKLY) as NotificationFrequency;
    const now = new Date();

    const newRecord = await userNotificationsRepositories.create({
      id: v4(),
      userId,
      frequency: newFrequency,
      lastNotificationDate: now,
      nextNotificationDate: calculateNextNotificationDate(newFrequency),
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
      notificationPreference: newFrequency,
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

    const now = new Date();
    if (!existing) {
      const newRecord = await userNotificationsRepositories.create({
        id: v4(),
        userId,
        frequency: NotificationFrequency.WEEKLY,
        lastNotificationDate: now,
        nextNotificationDate: calculateNextNotificationDate(
          NotificationFrequency.WEEKLY
        ),
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

const getDueNotificationEmailsService = errorUtilities.withServiceErrorHandling(
  async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueNotifications = await userNotificationsRepositories.getMany({
      nextNotificationDate: {
        [Op.lte]: today,
      },
      frequency: {
        [Op.ne]: "never",
      },
    });

    if (!dueNotifications || dueNotifications.length === 0) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        NotificationResponses.SUCCESSFUL_PROCESS,
        { emails: [] }
      );
    }

    const userIds = dueNotifications.map((notification) => notification.userId);

    const users = await userRepositories.getMany({
      id: {
        [Op.in]: userIds,
      },
    });

    if (!users || users.length === 0) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        NotificationResponses.SUCCESSFUL_PROCESS,
        { emails: [] }
      );
    }

    const emails = users.map((user) => user.email).filter(Boolean);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      NotificationResponses.SUCCESSFUL_PROCESS,
      {
        emails,
        count: emails.length,
      }
    );
  }
);

export default {
  upsertUserNotificationService,
  getUserNotificationSettingService,
  getDueNotificationEmailsService,
};
