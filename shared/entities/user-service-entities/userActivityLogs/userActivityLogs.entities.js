"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActivityLog = void 0;
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
const users_entities_1 = __importDefault(require("../users/users.entities"));
const user_service_types_1 = require("../../../databaseTypes/user-service-types");
class UserActivityLog extends sequelize_1.Model {
}
exports.UserActivityLog = UserActivityLog;
UserActivityLog.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: users_entities_1.default,
            key: 'id',
        },
    },
    activityType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(user_service_types_1.ActivityType)),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING(45),
        allowNull: true,
    },
    userAgent: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
    level: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(user_service_types_1.LogLevel)),
        allowNull: false,
        defaultValue: user_service_types_1.LogLevel.INFO,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    sessionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    resourceId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    success: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'UserActivityLogs',
    tableName: 'user_activity_logs',
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['activityType'],
        },
        {
            fields: ['timestamp'],
        },
        {
            fields: ['userId', 'activityType'],
        },
        {
            fields: ['level'],
        },
    ],
});
