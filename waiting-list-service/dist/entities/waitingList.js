"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../config/databases");
class WaitingList extends sequelize_1.Model {
}
WaitingList.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    sendUpdates: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    betaTest: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    contributeSkills: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: databases_1.founders_list_db,
    modelName: 'WaitingList',
    tableName: 'waiting_lists',
    timestamps: true,
});
exports.default = WaitingList;
