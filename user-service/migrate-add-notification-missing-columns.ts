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
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: {
    ssl: { require: false, rejectUnauthorized: false },
  },
  logging: console.log,
});

async function runMigration() {
  try {
    console.log("Starting migration: add missing columns to notification_settings");

    await sequelize.authenticate();
    console.log("Database connection established successfully");

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `
        ALTER TABLE "notification_settings"
          ADD COLUMN IF NOT EXISTS "lastNotificationDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS "nextNotificationDate" TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS "sentTemplates"        JSONB NOT NULL DEFAULT '[]';
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
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
