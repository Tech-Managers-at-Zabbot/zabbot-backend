CREATE TABLE IF NOT EXISTS notification_settings (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"                UUID        NOT NULL UNIQUE REFERENCES users(id),
    frequency               "enum_notification_settings_frequency" NOT NULL DEFAULT 'weekly',
    "lastNotificationDate"  TIMESTAMPTZ,
    "sentTemplates"         JSONB       NOT NULL DEFAULT '[]',
    "nextNotificationDate"  TIMESTAMPTZ,
    "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
