"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Score calculation constants
const SCORE_WEIGHTS = {
    correctQuiz: 10, // Points per correct quiz
    dailyWordListened: 2, // Points per daily word listened
    firstAttemptBonus: 5, // Bonus for getting it right first try
    streakMultiplier: 1.5 // Multiplier for consecutive days
};
