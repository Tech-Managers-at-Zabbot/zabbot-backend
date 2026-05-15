CREATE TABLE IF NOT EXISTS user_activity_logs (
    id              SERIAL          PRIMARY KEY,
    "userId"        INTEGER         NOT NULL,
    "activityType"  "enum_user_activity_logs_activityType" NOT NULL,
    description     TEXT            NOT NULL,
    "ipAddress"     VARCHAR(45),
    "userAgent"     TEXT,
    metadata        JSONB,
    level           "enum_user_activity_logs_level" NOT NULL DEFAULT 'INFO',
    timestamp       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "sessionId"     VARCHAR(255),
    "resourceId"    VARCHAR(255),
    success         BOOLEAN         NOT NULL DEFAULT TRUE,
    "createdAt"     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "user_activity_logs_userId_idx"               ON user_activity_logs ("userId");
CREATE INDEX IF NOT EXISTS "user_activity_logs_activityType_idx"         ON user_activity_logs ("activityType");
CREATE INDEX IF NOT EXISTS "user_activity_logs_timestamp_idx"            ON user_activity_logs (timestamp);
CREATE INDEX IF NOT EXISTS "user_activity_logs_userId_activityType_idx"  ON user_activity_logs ("userId", "activityType");
CREATE INDEX IF NOT EXISTS "user_activity_logs_level_idx"                ON user_activity_logs (level);