"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
class UserLessons extends sequelize_1.Model {
}
UserLessons.init({
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
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: "courses",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    lessonId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: "lessons",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    languageId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: "languages",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    percentageCompletion: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100,
        },
    },
    isCompleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    score: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0,
        },
    },
    startedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    completedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    lastAccessed: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: "UserLessons",
    tableName: "user_lessons",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["userId", "lessonId"],
            name: "user_lessons_userId_lessonId_unique_idx",
        },
        {
            fields: ["userId", "courseId"],
            name: "user_lessons_userId_courseId_idx",
        },
        {
            fields: ["userId", "isCompleted"],
            name: "user_lessons_userId_isCompleted_idx",
        },
        {
            fields: ["courseId", "lessonId"],
            name: "user_lessons_courseId_lessonId_idx",
        },
    ],
});
exports.default = UserLessons;
