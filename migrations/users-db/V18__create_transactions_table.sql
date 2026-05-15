CREATE TABLE IF NOT EXISTS transactions (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"                UUID            NOT NULL REFERENCES users(id),
    "paymentGateway"        "enum_transactions_paymentGateway"   NOT NULL,
    "gatewayTransactionId"  VARCHAR(255)    UNIQUE,
    "gatewayCustomerId"     VARCHAR(255),
    "gatewaySubscriptionId" VARCHAR(255),
    "transactionType"       "enum_transactions_transactionType"  NOT NULL,
    amount                  DECIMAL(10, 2)  NOT NULL,
    currency                VARCHAR(3)      NOT NULL DEFAULT 'USD',
    status                  "enum_transactions_status" NOT NULL DEFAULT 'pending',
    "planType"              "enum_transactions_planType",
    "planId"                UUID            REFERENCES subscription_plans(id),
    "paymentMethod"         VARCHAR(255),
    last4                   VARCHAR(4),
    "paidAt"                TIMESTAMPTZ,
    "failedAt"              TIMESTAMPTZ,
    "refundedAt"            TIMESTAMPTZ,
    "cancelledAt"           TIMESTAMPTZ,
    "failureReason"         TEXT,
    "failureCode"           VARCHAR(255),
    description             TEXT,
    metadata                JSON,
    "createdAt"             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "transactions_userId_idx"               ON transactions ("userId");
CREATE INDEX IF NOT EXISTS "transactions_gatewayTransactionId_idx" ON transactions ("gatewayTransactionId");
CREATE INDEX IF NOT EXISTS "transactions_status_idx"               ON transactions (status);
CREATE INDEX IF NOT EXISTS "transactions_userId_status_idx"        ON transactions ("userId", status);
CREATE INDEX IF NOT EXISTS "transactions_createdAt_idx"            ON transactions ("createdAt");
