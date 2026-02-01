import { Model } from "sequelize";
import { UserLeaderboardAttributes } from "../../../databaseTypes/leaderboard-types";
declare class UserLeaderboard extends Model<UserLeaderboardAttributes> implements UserLeaderboardAttributes {
    id: string;
    userId: string;
    username?: string;
    avatar?: string;
    dailyScore: number;
    weeklyScore: number;
    allTimeScore: number;
    quizzesCompleted: number;
    quizzesCorrect: number;
    dailyWordsListened: number;
    lastUpdated: Date;
    lastUpdatedDate: Date;
    lastUpdatedWeek: Date;
    weekStartDate: Date;
    dayStartDate: Date;
    dailyRank?: number;
    weeklyRank?: number;
    allTimeRank?: number;
}
export default UserLeaderboard;
