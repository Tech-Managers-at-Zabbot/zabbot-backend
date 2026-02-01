import { DataTypes, Model } from "sequelize";
import { users_service_db } from "../../../../config/databases";
import { UserLeaderboardAttributes } from "../../../databaseTypes/leaderboard-types";

class UserLeaderboard
  extends Model<UserLeaderboardAttributes>
  implements UserLeaderboardAttributes
{
  public id!: string;
  public userId!: string;
  public username?: string;
  public avatar?: string;

  public dailyScore!: number;
  public weeklyScore!: number;
  public allTimeScore!: number;

  public quizzesCompleted!: number;
  public quizzesCorrect!: number;
  public dailyWordsListened!: number;

  public lastUpdated!: Date;
  public lastUpdatedDate!: Date;
  public lastUpdatedWeek!: Date;
  public weekStartDate!: Date;
  public dayStartDate!: Date;

  public dailyRank?: number;
  public weeklyRank?: number;
  public allTimeRank?: number;
}

UserLeaderboard.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Scores
    dailyScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    weeklyScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    allTimeScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // Activity tracking
    quizzesCompleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    quizzesCorrect: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    dailyWordsListened: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // Time tracking
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    lastUpdatedDate: {           // <-- new column
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    lastUpdatedWeek: {           // <-- new column
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    weekStartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    dayStartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    // Rankings (denormalized for fast reads)
    dailyRank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    weeklyRank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    allTimeRank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize: users_service_db,
    modelName: "UserLeaderboard",
    tableName: "user_leaderboard",
    timestamps: true,
    indexes: [
      { fields: ["dailyScore"] },
      { fields: ["weeklyScore"] },
      { fields: ["allTimeScore"] },
    ],
  }
);

export default UserLeaderboard;
