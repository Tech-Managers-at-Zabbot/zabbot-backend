"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
class Flashcards extends sequelize_1.Model {
}
Flashcards.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    language: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    yorubaWord: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    englishWord: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    transcription: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    tonal: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    audio: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
    },
    iconAttributions: {
        type: sequelize_1.DataTypes.JSON,
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
    modelName: "Flashcards",
    tableName: "flashcards",
    timestamps: true,
});
exports.default = Flashcards;
