"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
class UserQuizAnswers extends sequelize_1.Model {
    id;
    userId;
    quizId;
    courseId;
    lessonId;
    contentId;
    userAnswer;
    isCorrect;
    createdAt;
    updatedAt;
}
UserQuizAnswers.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    quizId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    lessonId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    contentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    userAnswer: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    isCorrect: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'UserQuizAnswers',
    tableName: 'user_quiz_answers',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'quizId'],
        },
        {
            fields: ['userId', 'courseId'],
        },
        {
            fields: ['userId', 'lessonId'],
        },
        {
            fields: ['userId', 'contentId'],
        }
    ]
});
exports.default = UserQuizAnswers;
