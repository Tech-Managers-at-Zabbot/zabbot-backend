"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../config/databases");
const user_service_types_1 = require("../../databaseTypes/user-service-types");
class Users extends sequelize_1.Model {
    id;
    firstName;
    lastName;
    email;
    password;
    isVerified;
    isFirstTimeLogin;
    role;
    isActive;
    isBlocked;
    verifiedAt;
    registerMethod;
    googleAccessToken;
    googleRefreshToken;
    accessToken;
    refreshToken;
    country;
    phoneNumber;
    deletedAt;
    profilePicture;
    bio;
    dateOfBirth;
    address;
    timeZone;
    socialLinks;
    preferences;
    lastLoginAt;
    lastPasswordChangeAt;
    twoFactorEnabled;
    securityQuestions;
}
Users.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
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
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    verifiedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    isBlocked: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isFirstTimeLogin: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    role: {
        allowNull: false,
        type: sequelize_1.DataTypes.ENUM(...Object.values(user_service_types_1.UserRoles)),
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    profilePicture: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    bio: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    dateOfBirth: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    socialLinks: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    preferences: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    lastLoginAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    timeZone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    lastPasswordChangeAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    twoFactorEnabled: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    securityQuestions: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    registerMethod: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(user_service_types_1.RegisterMethods)),
        allowNull: false,
    },
    googleAccessToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    googleRefreshToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    accessToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    refreshToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: 'Users',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
});
exports.default = Users;
