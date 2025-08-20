"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
class UserCourses extends sequelize_1.Model {
    id;
    userId;
    courseId;
    isCompleted;
    lastAccessed;
    progress;
    lastLessonId;
    lastContentId;
    languageId;
    isActive;
}
UserCourses.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    languageId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    lastAccessed: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    progress: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    lastLessonId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    lastContentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    isCompleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    }
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'User_Courses',
    tableName: 'user_courses',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'courseId']
        }
    ]
});
exports.default = UserCourses;
