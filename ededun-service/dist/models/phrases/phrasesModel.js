"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phrases = void 0;
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
const modelTypes_1 = require("../../types/modelTypes");
class Phrases extends sequelize_1.Model {
}
exports.Phrases = Phrases;
Phrases.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    english_text: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    yoruba_text: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    pronounciation_note: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    phrase_category: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(modelTypes_1.PhraseCategory)),
        defaultValue: modelTypes_1.PhraseCategory.Other,
    }
}, {
    sequelize: databases_1.ededun_database,
    tableName: "Phrases",
});
exports.default = Phrases;
