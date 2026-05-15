CREATE TABLE IF NOT EXISTS security_logs (
    id          SERIAL          PRIMARY KEY,
    "userId"    INTEGER,
    "eventType" VARCHAR(255)    NOT NULL,
    severity    "enum_security_logs_severity" NOT NULL,
    "ipAddress" VARCHAR(45)     NOT NULL,
    "userAgent" TEXT,
    details     JSONB           NOT NULL,
    timestamp   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    resolved    BOOLEAN         NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS "security_logs_userId_idx"    ON security_logs ("userId");
CREATE INDEX IF NOT EXISTS "security_logs_eventType_idx" ON security_logs ("eventType");
CREATE INDEX IF NOT EXISTS "security_logs_severity_idx"  ON security_logs (severity);
CREATE INDEX IF NOT EXISTS "security_logs_timestamp_idx" ON security_logs (timestamp);
CREATE INDEX IF NOT EXISTS "security_logs_resolved_idx"  ON security_logs (resolved);