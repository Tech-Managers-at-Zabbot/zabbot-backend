CREATE TABLE IF NOT EXISTS user_leaderboard (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"            UUID        NOT NULL UNIQUE,
    username            VARCHAR(255),
    avatar              VARCHAR(255),
    "dailyScore"        INTEGER     NOT NULL DEFAULT 0,
    "weeklyScore"       INTEGER     NOT NULL DEFAULT 0,
    "allTimeScore"      INTEGER     NOT NULL DEFAULT 0,
    "quizzesCompleted"  INTEGER     NOT NULL DEFAULT 0,
    "quizzesCorrect"    INTEGER     NOT NULL DEFAULT 0,
    "dailyWordsListened" INTEGER    NOT NULL DEFAULT 0,
    "lastUpdated"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "lastUpdatedDate"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "lastUpdatedWeek"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "weekStartDate"     TIMESTAMPTZ NOT NULL,
    "dayStartDate"      TIMESTAMPTZ NOT NULL,
    "dailyRank"         INTEGER,
    "weeklyRank"        INTEGER,
    "allTimeRank"       INTEGER,
    "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "user_leaderboard_dailyScore_idx"   ON user_leaderboard ("dailyScore");
CREATE INDEX IF NOT EXISTS "user_leaderboard_weeklyScore_idx"  ON user_leaderboard ("weeklyScore");
CREATE INDEX IF NOT EXISTS "user_leaderboard_allTimeScore_idx" ON user_leaderboard ("allTimeScore");
