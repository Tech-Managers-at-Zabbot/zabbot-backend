"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../config/databases");
const enums_1 = require("../data-types/enums");
class Contents extends sequelize_1.Model {
    id;
    lessonId;
    languageContentId;
    translation;
    createdAt;
    updatedAt;
    isGrammarRule;
    sourceType;
    customText;
    ededunPhrases;
}
Contents.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    lessonId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    },
    isGrammarRule: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    sourceType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(enums_1.ContentSourceType)),
        allowNull: false,
        defaultValue: enums_1.ContentSourceType.NEW
    },
    customText: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    ededunPhrases: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true
    },
    translation: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
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
    modelName: 'Contents',
    tableName: 'contents',
});
exports.default = Contents;
