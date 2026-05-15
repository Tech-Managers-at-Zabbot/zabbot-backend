CREATE TABLE IF NOT EXISTS user_leaderboard_history (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"            UUID        NOT NULL,
    "periodType"        "enum_user_leaderboard_history_periodType" NOT NULL,
    "periodStart"       TIMESTAMPTZ NOT NULL,
    "periodEnd"         TIMESTAMPTZ NOT NULL,
    score               INTEGER     DEFAULT 0,
    "quizzesCompleted"  INTEGER     DEFAULT 0,
    "quizzesCorrect"    INTEGER     DEFAULT 0,
    "wordsListened"     INTEGER     DEFAULT 0,
    "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
