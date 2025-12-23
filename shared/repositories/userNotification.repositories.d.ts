import NotificationSetting from "../entities/user-service-entities/userNotificationSettings/userNotificationSettings.entities";
import { Transaction } from "sequelize";
declare const userNotificationsRepositories: {
    create: (data: any, transaction?: Transaction) => Promise<NotificationSetting>;
    updateOne: (filter: any, update: any, transaction?: Transaction) => Promise<any>;
    updateMany: (filter: any, update: any) => Promise<{
        affectedRows: number;
    }>;
    deleteOne: (filter: any) => Promise<NotificationSetting>;
    deleteMany: (filter: any) => Promise<{
        affectedRows: number;
    }>;
    getOne: (filter: Record<string, any>, projection?: any) => Promise<NotificationSetting | null>;
    getAllCount: () => Promise<number | undefined>;
    getMany: (filter: any, projection?: any, options?: any, order?: any) => Promise<NotificationSetting[]>;
};
export default userNotificationsRepositories;
