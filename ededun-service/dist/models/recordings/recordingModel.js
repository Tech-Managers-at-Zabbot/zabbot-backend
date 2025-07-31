"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recordings = void 0;
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
class Recordings extends sequelize_1.Model {
}
exports.Recordings = Recordings;
Recordings.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    user_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    phrase_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    recording_url: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: databases_1.ededun_database,
    tableName: "Recordings",
});
exports.default = Recordings;
