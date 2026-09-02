"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
class UserLeaderboard extends sequelize_1.Model {
}
UserLeaderboard.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    avatar: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    // Scores
    dailyScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    weeklyScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    allTimeScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    // Activity tracking
    quizzesCompleted: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    quizzesCorrect: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    dailyWordsListened: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    // Time tracking
    lastUpdated: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    lastUpdatedDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    lastUpdatedWeek: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    weekStartDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    dayStartDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    // Rankings (denormalized for fast reads)
    dailyRank: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    weeklyRank: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    allTimeRank: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: "UserLeaderboard",
    tableName: "user_leaderboard",
    timestamps: true,
    indexes: [
        { fields: ["dailyScore"] },
        { fields: ["weeklyScore"] },
        { fields: ["allTimeScore"] },
    ],
});
exports.default = UserLeaderboard;
