"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databases_1 = require("../../../../config/databases");
class UserLeaderboardHistory extends sequelize_1.Model {
}
UserLeaderboardHistory.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    periodType: {
        type: sequelize_1.DataTypes.ENUM("DAY", "WEEK", "MONTH"),
        allowNull: false,
    },
    periodStart: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    periodEnd: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    score: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    quizzesCompleted: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    quizzesCorrect: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    wordsListened: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: Date.now,
    },
}, {
    sequelize: databases_1.users_service_db,
    modelName: "UserLeaderboardHistory",
    tableName: "user_leaderboard_history",
    timestamps: true,
    // paranoid: true,
});
exports.default = UserLeaderboardHistory;
