"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../config/databases");
const users_entities_1 = __importDefault(require("./users.entities"));
const users_types_1 = require("../types/users.types");
class Otp extends sequelize_1.Model {
}
Otp.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: users_entities_1.default,
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    otp: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isAfter: new Date().toISOString(),
        },
    },
    isUsed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    notificationType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(users_types_1.OtpNotificationType)),
        allowNull: false,
    },
    attempts: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 10,
        },
    },
    verifiedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'Otp',
    tableName: 'otps',
    timestamps: true,
    paranoid: false,
    indexes: [
        {
            fields: ['userId', 'notificationType'],
        },
        {
            fields: ['expiresAt'],
        },
        {
            fields: ['createdAt'],
        },
    ],
    hooks: {
        beforeCreate: (otp) => {
            if (!otp.expiresAt) {
                otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            }
        },
    },
});
exports.default = Otp;
