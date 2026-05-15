CREATE TABLE IF NOT EXISTS user_courses (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"        UUID        NOT NULL,
    "languageId"    UUID        NOT NULL,
    "courseId"      UUID        NOT NULL,
    "lastAccessed"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    progress        INTEGER     NOT NULL DEFAULT 0,
    "lastLessonId"  UUID,
    "lastContentId" UUID,
    "isCompleted"   BOOLEAN     NOT NULL DEFAULT FALSE,
    "isActive"      BOOLEAN     NOT NULL DEFAULT TRUE,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_courses_userId_lastLessonId_unique_idx"
    ON user_courses ("userId", "lastLessonId")
    WHERE "lastLessonId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "user_courses_userId_courseId_idx" ON user_courses ("userId", "courseId");
CREATE INDEX IF NOT EXISTS "user_courses_courseId_idx"        ON user_courses ("courseId");