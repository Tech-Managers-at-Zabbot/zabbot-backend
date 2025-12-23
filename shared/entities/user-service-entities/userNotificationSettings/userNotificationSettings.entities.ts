import { DataTypes, Model } from "sequelize";
import { users_service_db } from "../../../../config/databases";

export enum NotificationFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  NEVER = "never",
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

class NotificationSetting
  extends Model<NotificationSettingAttributes>
  implements NotificationSettingAttributes
{
  public id!: string;
  public userId!: string;
  public frequency!: NotificationFrequency;
  public lastNotificationDate!: Date;
  public nextNotificationDate!: Date;
  public sentTemplates!: string[];
  public createdAt?: Date;
  public updatedAt?: Date;
}

NotificationSetting.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      unique: true,
    },

    frequency: {
      type: DataTypes.ENUM(...Object.values(NotificationFrequency)),
      allowNull: false,
      defaultValue: NotificationFrequency.WEEKLY,
    },
    lastNotificationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Date.now(),
    },
    sentTemplates: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    nextNotificationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: () => {
        const now = new Date();
        now.setDate(now.getDate() + 7);
        return now;
      },
    },
  },
  {
    sequelize: users_service_db,
    modelName: "NotificationSetting",
    tableName: "notification_settings",
    timestamps: true,
  }
);

export default NotificationSetting;
