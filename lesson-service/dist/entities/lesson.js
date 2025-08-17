"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../config/databases");
class Lessons extends sequelize_1.Model {
}
Lessons.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    title: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false,
    },
    estimatedDuration: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    outcomes: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true
    },
    objectives: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true
    },
    languageId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    headLineTag: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true,
    },
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    totalContents: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    orderNumber: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'Lessons',
    tableName: 'lessons',
    timestamps: true,
});
exports.default = Lessons;
