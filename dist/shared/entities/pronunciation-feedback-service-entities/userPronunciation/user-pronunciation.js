"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
class UserPronunciation extends sequelize_1.Model {
    id;
    userId;
    pronunciationId;
    recordingUrl;
    pronuciationPlotUrl;
}
UserPronunciation.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    pronunciationId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    recordingUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    pronuciationPlotUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: "UserPronunciation",
    tableName: "user_pronunciation",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["userId", "pronunciationId"],
        },
    ],
});
exports.default = UserPronunciation;
