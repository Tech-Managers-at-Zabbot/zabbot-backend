export interface UserLeaderboardAttributes {
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
export type PeriodType = "DAY" | "WEEK" | "MONTH";
export interface UserLeaderboardHistoryAttributes {
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
