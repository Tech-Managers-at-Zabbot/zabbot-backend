CREATE TABLE IF NOT EXISTS subscription_plans (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    "planType"          "enum_subscription_plans_planType" NOT NULL UNIQUE,
    price               DECIMAL(10, 2)  NOT NULL,
    currency            VARCHAR(3)      NOT NULL DEFAULT 'USD',
    "billingCycleMonths" INTEGER,
    features            JSON,
    "createdAt"         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
