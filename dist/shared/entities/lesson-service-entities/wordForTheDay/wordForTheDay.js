"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
class WordForTheDay extends sequelize_1.Model {
    id;
    languageId;
    dateUsed;
    isActive;
    audioUrls;
    languageText;
    englishText;
    isUsed;
    pronunciationNote;
}
WordForTheDay.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    languageId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: "languages",
            key: "id",
        },
    },
    dateUsed: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    audioUrls: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    languageText: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    englishText: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    pronunciationNote: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isUsed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: "WordForTheDay",
    tableName: "wordForTheDay",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["languageId", "dateUsed"],
        },
    ],
});
exports.default = WordForTheDay;
