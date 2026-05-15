CREATE TABLE IF NOT EXISTS courses (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(255)    NOT NULL,
    description         VARCHAR(255),
    "isActive"          BOOLEAN         NOT NULL DEFAULT TRUE,
    "languageId"        UUID            NOT NULL,
    level               "enum_courses_level" NOT NULL,
    "estimatedDuration" INTEGER,
    "totalLessons"      INTEGER         DEFAULT 0,
    "totalContents"     INTEGER         DEFAULT 0,
    "thumbnailImage"    VARCHAR(255),
    tags                TEXT[],
    prerequisites       UUID[],
    "createdAt"         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);