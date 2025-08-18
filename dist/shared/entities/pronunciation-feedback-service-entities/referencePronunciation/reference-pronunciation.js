"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
class ReferencePronunciation extends sequelize_1.Model {
    id;
    word;
    englishWord;
    yorubaWord;
    femaleVoice;
    maleVoice;
    tone;
}
ReferencePronunciation.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    englishWord: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    yorubaWord: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    femaleVoice: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    maleVoice: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    tone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: "ReferencePronunciation",
    tableName: "reference_pronunciation",
    timestamps: true,
});
exports.default = ReferencePronunciation;
