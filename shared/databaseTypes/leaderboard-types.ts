// models/Leaderboard.ts or schema
export interface UserLeaderboardAttributes {
  id: string;
  userId: string;
  username?: string;
  avatar?: string;
  
  // Scores
  dailyScore: number;
  weeklyScore: number;
  allTimeScore: number;
  
  // Activity tracking
  quizzesCompleted: number;
  quizzesCorrect: number;
  dailyWordsListened: number;
  
  // Time tracking
  lastUpdated: Date;
  lastUpdatedDate: Date;
  lastUpdatedWeek: Date;
  weekStartDate: Date;
  dayStartDate: Date;
  
  // Rankings
  dailyRank?: number;
  weeklyRank?: number;
  allTimeRank?: number;
}

// Score calculation constants
const SCORE_WEIGHTS = {
  correctQuiz: 10,      // Points per correct quiz
  dailyWordListened: 2, // Points per daily word listened
  firstAttemptBonus: 5, // Bonus for getting it right first try
  streakMultiplier: 1.5 // Multiplier for consecutive days
};

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
