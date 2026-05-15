CREATE TABLE IF NOT EXISTS otps (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"            UUID            NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    otp                 TEXT            NOT NULL,
    "expiresAt"         TIMESTAMPTZ     NOT NULL,
    "isUsed"            BOOLEAN         NOT NULL DEFAULT FALSE,
    "notificationType"  "enum_otps_notificationType" NOT NULL,
    attempts            INTEGER         DEFAULT 0,
    "verifiedAt"        TIMESTAMPTZ,
    "createdAt"         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "otps_userId_notificationType_idx" ON otps ("userId", "notificationType");
CREATE INDEX IF NOT EXISTS "otps_expiresAt_idx"               ON otps ("expiresAt");
CREATE INDEX IF NOT EXISTS "otps_createdAt_idx"               ON otps ("createdAt");