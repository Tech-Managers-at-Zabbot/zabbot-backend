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
            model: 'users',
            key: 'id',
        },
        unique: true,
    },
    frequency: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(NotificationFrequency)),
        allowNull: false,
        defaultValue: NotificationFrequency.WEEKLY,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: "NotificationSetting",
    tableName: "notification_settings",
    timestamps: true,
});
exports.default = NotificationSetting;
