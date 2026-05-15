CREATE TABLE IF NOT EXISTS "userDailyGoals" (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"                UUID        NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    "languageId"            UUID        REFERENCES languages(id) ON UPDATE CASCADE ON DELETE CASCADE,
    "isCompleted"           BOOLEAN     NOT NULL DEFAULT FALSE,
    "percentageCompletion"  INTEGER     NOT NULL DEFAULT 0,
    date                    DATE        NOT NULL,
    "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);