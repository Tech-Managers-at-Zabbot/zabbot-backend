"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
const lesson_service_types_1 = require("../../../databaseTypes/lesson-service-types");
class Contents extends sequelize_1.Model {
}
Contents.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    lessonId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    languageId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    isGrammarRule: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    contentType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(lesson_service_types_1.ContentType)),
        allowNull: false,
        defaultValue: lesson_service_types_1.ContentType.NORMAL,
    },
    proverb: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    grammarTitle: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    grammarSubtitle: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    grammarDescription: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    grammarExamples: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    sourceType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(lesson_service_types_1.ContentSourceType)),
        allowNull: false,
        defaultValue: lesson_service_types_1.ContentSourceType.NEW,
    },
    customText: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    ededunPhrases: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    translation: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.DATE,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: "Contents",
    tableName: "contents",
    // timestamps: true,
});
exports.default = Contents;
//     const content = {
//   contentType: "grammar",
//   grammarTitle: "Honorifics and Respect Markers",
//   grammarSubtitle: "Yoruba is highly respectful in tone, especially when speaking to elders.",
//   grammarDescription: [
//     'Prefix "ẹ" is used when addressing elders and when there is more than one person being addressed.',
//     'Kú is the expression for greetings, weather, temperature and many other purposes.'
//   ],
//   grammarExamples: [
//     { yoruba: "Ẹ káàlẹ́.", translation: "Good evening. (when speaking to older person or multiple people)" },
//     { yoruba: "Kú ìsinmi", translation: "Greeting someone who is resting (person is a peer or younger)" }
//   ]
// }
