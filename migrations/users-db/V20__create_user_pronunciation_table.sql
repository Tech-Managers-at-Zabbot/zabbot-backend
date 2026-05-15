CREATE TABLE IF NOT EXISTS user_pronunciation (
    id                      UUID        PRIMARY KEY,
    "userId"                UUID        NOT NULL,
    "pronunciationId"       UUID        NOT NULL,
    "recordingUrl"          VARCHAR(255) NOT NULL,
    "pronuciationPlotUrl"   VARCHAR(255) NOT NULL,
    "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_pronunciation_userId_pronunciationId_unique_idx"
    ON user_pronunciation ("userId", "pronunciationId");
