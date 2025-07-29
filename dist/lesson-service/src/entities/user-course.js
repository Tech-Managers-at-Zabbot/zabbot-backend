"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../config/databases");
class UserCourses extends sequelize_1.Model {
    id;
    userId;
    courseId;
    createdAt;
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
        unique: true
    },
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.DATE
    }
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'User_Courses',
    tableName: 'user_courses',
    timestamps: true,
    paranoid: true,
});
exports.default = UserCourses;
