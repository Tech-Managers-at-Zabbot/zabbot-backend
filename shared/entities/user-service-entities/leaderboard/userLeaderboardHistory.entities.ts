import { DataTypes, Model } from "sequelize";
import { users_service_db } from "../../../../config/databases";
import {
  PeriodType,
  UserLeaderboardHistoryAttributes,
} from "../../../databaseTypes/leaderboard-types";

class UserLeaderboardHistory
  extends Model<UserLeaderboardHistoryAttributes>
  implements UserLeaderboardHistoryAttributes
{
  public id!: string;
  public userId!: string;
  public periodType!: PeriodType;
  public periodStart!: Date;
  public periodEnd!: Date;
  public score!: number;
  public quizzesCompleted!: number;
  public quizzesCorrect!: number;
  public wordsListened!: number;
  public createdAt!: Date;
}

UserLeaderboardHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    periodType: {
      type: DataTypes.ENUM("DAY", "WEEK", "MONTH"),
      allowNull: false,
    },

    periodStart: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    periodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    quizzesCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    quizzesCorrect: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    wordsListened: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now,
    },
  },
  {
    sequelize: users_service_db,
    modelName: "UserLeaderboardHistory",
    tableName: "user_leaderboard_history",
    timestamps: true,
    // paranoid: true,
  }
);

export default UserLeaderboardHistory;
