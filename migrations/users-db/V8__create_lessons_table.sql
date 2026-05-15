CREATE TABLE IF NOT EXISTS lessons (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT        NOT NULL,
    description         TEXT        NOT NULL,
    "estimatedDuration" INTEGER     NOT NULL,
    outcomes            TEXT,
    objectives          TEXT,
    "languageId"        UUID        NOT NULL,
    "headLineTag"       TEXT,
    "lessonImg"         TEXT,
    "courseId"          UUID        NOT NULL,
    "totalContents"     INTEGER     DEFAULT 0,
    "orderNumber"       INTEGER     NOT NULL,
    "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);