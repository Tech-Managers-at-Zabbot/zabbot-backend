import { Model } from "sequelize";
import { PeriodType, UserLeaderboardHistoryAttributes } from "../../../databaseTypes/leaderboard-types";
declare class UserLeaderboardHistory extends Model<UserLeaderboardHistoryAttributes> implements UserLeaderboardHistoryAttributes {
    id: string;
    userId: string;
    periodType: PeriodType;
    periodStart: Date;
    periodEnd: Date;
    score: number;
    quizzesCompleted: number;
    quizzesCorrect: number;
    wordsListened: number;
    createdAt: Date;
}
export default UserLeaderboardHistory;
