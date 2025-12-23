import { Model } from "sequelize";
export declare enum NotificationFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    BIWEEKLY = "biweekly",
    NEVER = "never"
}
export interface NotificationSettingAttributes {
    id: string;
    userId: string;
    frequency: NotificationFrequency;
    lastNotificationDate: Date;
    nextNotificationDate: Date;
    sentTemplates: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
declare class NotificationSetting extends Model<NotificationSettingAttributes> implements NotificationSettingAttributes {
    id: string;
    userId: string;
    frequency: NotificationFrequency;
    lastNotificationDate: Date;
    nextNotificationDate: Date;
    sentTemplates: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
export default NotificationSetting;
