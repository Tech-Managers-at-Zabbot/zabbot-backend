CREATE TABLE IF NOT EXISTS languages (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255)    NOT NULL,
    code        "enum_languages_code" NOT NULL,
    "flagIcon"  VARCHAR(255),
    "isActive"  BOOLEAN         NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);