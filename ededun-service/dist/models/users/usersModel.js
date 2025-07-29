"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
const modelTypes_1 = require("../../types/modelTypes");
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        unique: {
            name: "unique_email",
            msg: "Email already in use",
        },
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(modelTypes_1.Roles)),
        allowNull: false,
        validate: {
            isIn: [Object.values(modelTypes_1.Roles)],
        },
    },
    gender: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(modelTypes_1.Gender)),
        allowNull: false,
    },
    ageGroup: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(modelTypes_1.AgeGroup)),
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    refreshToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: databases_1.ededun_database,
    tableName: "User",
});
exports.default = User;
