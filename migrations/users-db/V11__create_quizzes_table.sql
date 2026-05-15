CREATE TABLE IF NOT EXISTS quizzes (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "courseId"      UUID        NOT NULL,
    "lessonId"      UUID,
    "contentId"     UUID,
    "languageId"    UUID        NOT NULL,
    "quizType"      "enum_quizzes_quizType" NOT NULL,
    instruction     TEXT        NOT NULL,
    question        TEXT        NOT NULL,
    options         TEXT[],
    "correctOption" VARCHAR(255),
    "correctAnswer" VARCHAR(255),
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ
);