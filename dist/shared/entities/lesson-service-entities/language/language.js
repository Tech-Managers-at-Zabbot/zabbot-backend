"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
const lesson_service_types_1 = require("../../../databaseTypes/lesson-service-types");
class Languages extends sequelize_1.Model {
    id;
    title;
    code;
    isActive;
    flagIcon;
}
Languages.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(lesson_service_types_1.LanguageCode)),
        allowNull: false,
        unique: false,
    },
    flagIcon: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'Languages',
    tableName: 'languages',
    timestamps: true,
});
exports.default = Languages;
