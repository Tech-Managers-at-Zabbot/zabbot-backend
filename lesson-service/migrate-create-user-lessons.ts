import { QueryTypes, Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const USERS_SERVICE_DB = process.env.USERS_SERVICE_DEV_DB!;

if (!USERS_SERVICE_DB) {
  console.error("USERS_SERVICE_DEV_DB environment variable is not set");
  process.exit(1);
}

const sequelize = new Sequelize(USERS_SERVICE_DB, {
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: {
      require: false,
      rejectUnauthorized: false,
    },
  },
  logging: console.log,
});

async function runMigration() {
  try {
    console.log("Starting migration: create user_lessons table");

    await sequelize.authenticate();
    console.log("Database connection established successfully");

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `
        CREATE TABLE IF NOT EXISTS "user_lessons" (
          "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" UUID NOT NULL REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
          "courseId" UUID NOT NULL REFERENCES "courses" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
          "lessonId" UUID NOT NULL REFERENCES "lessons" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
          "languageId" UUID NOT NULL REFERENCES "languages" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
          "percentageCompletion" INTEGER NOT NULL DEFAULT 0,
          "isCompleted" BOOLEAN NOT NULL DEFAULT false,
          "score" NUMERIC(5, 2),
          "startedAt" TIMESTAMP WITH TIME ZONE,
          "completedAt" TIMESTAMP WITH TIME ZONE,
          "lastAccessed" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          CONSTRAINT "user_lessons_percentageCompletion_check"
            CHECK ("percentageCompletion" >= 0 AND "percentageCompletion" <= 100),
          CONSTRAINT "user_lessons_score_check"
            CHECK ("score" IS NULL OR "score" >= 0)
        );

        CREATE UNIQUE INDEX IF NOT EXISTS "user_lessons_userId_lessonId_unique_idx"
          ON "user_lessons" ("userId", "lessonId");

        CREATE INDEX IF NOT EXISTS "user_lessons_userId_courseId_idx"
          ON "user_lessons" ("userId", "courseId");

        CREATE INDEX IF NOT EXISTS "user_lessons_userId_isCompleted_idx"
          ON "user_lessons" ("userId", "isCompleted");

        CREATE INDEX IF NOT EXISTS "user_lessons_courseId_lessonId_idx"
          ON "user_lessons" ("courseId", "lessonId");
        `,
        { transaction, type: QueryTypes.RAW },
      );
    });

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await sequelize.close();
    console.log("Database connection closed");
  }
}

runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
