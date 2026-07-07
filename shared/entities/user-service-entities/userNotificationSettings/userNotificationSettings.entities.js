"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationFrequency = void 0;
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
var NotificationFrequency;
(function (NotificationFrequency) {
    NotificationFrequency["DAILY"] = "daily";
    NotificationFrequency["WEEKLY"] = "weekly";
    NotificationFrequency["BIWEEKLY"] = "biweekly";
    NotificationFrequency["NEVER"] = "never";
})(NotificationFrequency || (exports.NotificationFrequency = NotificationFrequency = {}));
class NotificationSetting extends sequelize_1.Model {
}
NotificationSetting.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
        unique: true,
    },
    frequency: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(NotificationFrequency)),
        allowNull: false,
        defaultValue: NotificationFrequency.WEEKLY,
    },
    lastNotificationDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: Date.now(),
    },
    sentTemplates: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    nextNotificationDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: () => {
            const now = new Date();
            now.setDate(now.getDate() + 7);
            return now;
        },
    },
    dailyReminders: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    weeklyReminders: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    biWeeklyReminders: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    noNotificationsAndReminders: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: "NotificationSetting",
    tableName: "notification_settings",
    timestamps: true,
});
exports.default = NotificationSetting;
