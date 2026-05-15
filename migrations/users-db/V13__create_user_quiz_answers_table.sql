CREATE TABLE IF NOT EXISTS user_quiz_answers (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID        NOT NULL,
    "quizId"    UUID        NOT NULL,
    "courseId"  UUID        NOT NULL,
    "lessonId"  UUID,
    "contentId" UUID,
    "userAnswer" VARCHAR(255) NOT NULL,
    "isCorrect" BOOLEAN     NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_quiz_answers_userId_quizId_unique_idx"
    ON user_quiz_answers ("userId", "quizId");

CREATE INDEX IF NOT EXISTS "user_quiz_answers_userId_courseId_idx"  ON user_quiz_answers ("userId", "courseId");
CREATE INDEX IF NOT EXISTS "user_quiz_answers_userId_lessonId_idx"  ON user_quiz_answers ("userId", "lessonId");
CREATE INDEX IF NOT EXISTS "user_quiz_answers_userId_contentId_idx" ON user_quiz_answers ("userId", "contentId");