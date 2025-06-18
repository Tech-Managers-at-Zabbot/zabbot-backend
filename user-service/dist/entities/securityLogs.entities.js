"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityLog = void 0;
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../config/databases");
const users_entities_1 = __importDefault(require("./users.entities"));
class SecurityLog extends sequelize_1.Model {
}
exports.SecurityLog = SecurityLog;
SecurityLog.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: users_entities_1.default,
            key: 'id',
        },
    },
    eventType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    severity: {
        type: sequelize_1.DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: false,
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING(45),
        allowNull: false,
    },
    userAgent: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    details: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    resolved: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'SecurityLog',
    tableName: 'security_logs',
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['eventType'],
        },
        {
            fields: ['severity'],
        },
        {
            fields: ['timestamp'],
        },
        {
            fields: ['resolved'],
        },
    ],
});
