"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../config/databases");
class LanguageContents extends sequelize_1.Model {
    id;
    languageId;
    title;
    word;
    tone;
    createdAt;
    updatedAt;
}
LanguageContents.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    languageId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    word: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    tone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
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
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'LanguageContents',
    tableName: 'language_contents',
    timestamps: true,
    paranoid: true,
});
exports.default = LanguageContents;
