import { QueryTypes, Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
dotenv.config();

const USERS_SERVICE_DB =
  process.env.USERS_SERVICE_DB ||
  process.env.USERS_SERVICE_PRODUCTION_DB ||
  process.env.USERS_SERVICE_DEV_DB;

if (!USERS_SERVICE_DB) {
  console.error(
    "No users database URL found. Set USERS_SERVICE_DB, USERS_SERVICE_PRODUCTION_DB, or USERS_SERVICE_DEV_DB."
  );
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
    console.log("Starting migration: add Stripe trial fields");

    await sequelize.authenticate();
    console.log("Database connection established successfully");

    // Must run in its own transaction, committed before the new value is used
    // below - Postgres forbids using a freshly-added enum value in the same
    // transaction that added it.
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `ALTER TYPE "enum_transactions_status" ADD VALUE IF NOT EXISTS 'trialing';`,
        { transaction, type: QueryTypes.RAW }
      );
    });

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `
        ALTER TABLE "users"
          ADD COLUMN IF NOT EXISTS "stripeCustomerId" VARCHAR(255);

        ALTER TABLE "user_subscriptions"
          ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP WITH TIME ZONE;

        ALTER TABLE "transactions"
          ADD COLUMN IF NOT EXISTS "paymentMethodId" VARCHAR(255),
          ADD COLUMN IF NOT EXISTS "scheduledChargeAt" TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS "chargeAttempts" INTEGER NOT NULL DEFAULT 0;

        CREATE INDEX IF NOT EXISTS "transactions_status_scheduledChargeAt_idx"
          ON "transactions" ("status", "scheduledChargeAt");
        `,
        { transaction, type: QueryTypes.RAW }
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
