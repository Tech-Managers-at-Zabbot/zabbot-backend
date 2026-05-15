CREATE TABLE IF NOT EXISTS user_subscriptions (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"                UUID        NOT NULL REFERENCES users(id),
    "planId"                UUID        NOT NULL REFERENCES subscription_plans(id),
    status                  "enum_user_subscriptions_status" NOT NULL DEFAULT 'active',
    "gatewaySubscriptionId" VARCHAR(255),
    "startDate"             TIMESTAMPTZ NOT NULL,
    "endDate"               TIMESTAMPTZ,
    "renewalDate"           TIMESTAMPTZ,
    "cancelledAt"           TIMESTAMPTZ,
    "cancellationReason"    TEXT,
    "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "user_subscriptions_userId_idx"                  ON user_subscriptions ("userId");
CREATE INDEX IF NOT EXISTS "user_subscriptions_planId_idx"                  ON user_subscriptions ("planId");
CREATE INDEX IF NOT EXISTS "user_subscriptions_userId_status_idx"           ON user_subscriptions ("userId", status);
CREATE INDEX IF NOT EXISTS "user_subscriptions_renewalDate_idx"             ON user_subscriptions ("renewalDate");
CREATE INDEX IF NOT EXISTS "user_subscriptions_gatewaySubscriptionId_idx"   ON user_subscriptions ("gatewaySubscriptionId");
