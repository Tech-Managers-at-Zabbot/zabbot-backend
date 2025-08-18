"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
const lesson_service_types_1 = require("../../../databaseTypes/lesson-service-types");
class Courses extends sequelize_1.Model {
    id;
    title;
    description;
    languageId;
    isActive;
    estimatedDuration;
    totalLessons;
    thumbnailImage;
    tags;
    prerequisites;
    createdAt;
    updatedAt;
    level;
    totalContents;
}
Courses.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    languageId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    level: {
        type: sequelize_1.DataTypes.ENUM,
        values: Object.values(lesson_service_types_1.Level),
        allowNull: false
    },
    estimatedDuration: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    totalLessons: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    totalContents: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    thumbnailImage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    tags: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: true,
    },
    prerequisites: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.UUID),
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.DATE
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'Courses',
    tableName: 'courses',
    timestamps: true,
});
exports.default = Courses;
