import NotificationSetting from "../../../../shared/entities/user-service-entities/userNotificationSettings/userNotificationSettings.entities";
import { Transaction } from "sequelize";
import { errorUtilities } from "../../../../shared/utilities";

const userNotificationsRepositories = {
  create: async (data: any, transaction?: Transaction) => {
    try {
      const newNotificationSettings = await NotificationSetting.create(data, {
        transaction,
      });
      return newNotificationSettings;
    } catch (error: any) {
      console.log(`Create notification error: ${error.message}`);
      throw errorUtilities.createError(
        `Error registering notification, please try again`,
        500
      );
    }
  },

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const notification: any = await NotificationSetting.findOne({
        where: filter,
      });
      await notification.update(update, { transaction });
      return notification;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error updating notification: ${error.message}`,
        400
      );
    }
  },

  updateMany: async (filter: any, update: any) => {
    try {
      const [affectedRows] = await NotificationSetting.update(update, {
        where: filter,
      });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error updating notification: ${error.message}`);
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const notification = await NotificationSetting.findOne({ where: filter });
      if (!notification) throw new Error("notification not found");
      await notification.destroy();
      return notification;
    } catch (error: any) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  },

  deleteMany: async (filter: any) => {
    try {
      const affectedRows = await NotificationSetting.destroy({ where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  },

  getOne: async (filter: Record<string, any>, projection: any = null) => {
    try {
      const notification = await NotificationSetting.findOne({
        where: filter,
        attributes: projection,
        raw: true,
      });
      return notification;
    } catch (error: any) {
      console.log(`Fetch notification error: ${error.message}`);
      throw errorUtilities.createError(
        `Error fetching notification, please try again`,
        500
      );
    }
  },

  getAllCount: async () => {
    try {
      const { count } = await NotificationSetting.findAndCountAll({});
      return count;
    } catch (error: any) {
      console.log(`Count notification error: ${error.message}`);
    }
  },

  getMany: async (
    filter: any,
    projection?: any,
    options?: any,
    order?: any
  ) => {
    try {
      const notifications = await NotificationSetting.findAll({
        where: filter,
        attributes: projection,
        ...options,
        order,
        raw: true,
      });
      return notifications;
    } catch (error: any) {
      throw new Error(`Error fetching notification: ${error.message}`);
    }
  },
};

export default userNotificationsRepositories;
