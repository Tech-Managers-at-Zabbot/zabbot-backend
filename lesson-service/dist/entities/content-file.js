"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../config/databases");
const enums_1 = require("../data-types/enums");
class ContentFiles extends sequelize_1.Model {
}
ContentFiles.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    contentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    },
    contentType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(enums_1.ContentDataType)),
        allowNull: false,
        defaultValue: enums_1.ContentDataType.AUDIO,
    },
    filePath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'ContentFiles',
    tableName: 'content_files',
    timestamps: true,
});
exports.default = ContentFiles;
