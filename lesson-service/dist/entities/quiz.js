"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../config/databases");
const enums_1 = require("../data-types/enums");
class Quizzes extends sequelize_1.Model {
}
Quizzes.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
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
    languageId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    quizType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(enums_1.QuizType)),
        allowNull: false,
    },
    instruction: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    question: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    options: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: true,
    },
    correctOption: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    correctAnswer: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
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
    modelName: 'Quizzes',
    tableName: 'quizzes',
    timestamps: true,
});
exports.default = Quizzes;
