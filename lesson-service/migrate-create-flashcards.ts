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
    console.log("Starting migration: create flashcards table");

    await sequelize.authenticate();
    console.log("Database connection established successfully");

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `
        CREATE TABLE IF NOT EXISTS "flashcards" (
          "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
          "language" VARCHAR(255) NOT NULL,
          "yorubaWord" VARCHAR(255) NOT NULL,
          "englishWord" VARCHAR(255) NOT NULL,
          "transcription" VARCHAR(255) NOT NULL,
          "tonal" VARCHAR(255) NOT NULL,
          "image" VARCHAR(255) NOT NULL,
          "audio" VARCHAR(255)[] NOT NULL DEFAULT ARRAY[]::VARCHAR(255)[],
          "iconAttributions" JSON NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE
        );
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
