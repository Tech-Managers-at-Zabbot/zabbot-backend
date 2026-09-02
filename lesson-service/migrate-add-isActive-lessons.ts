import { DataTypes, QueryTypes, Sequelize } from "sequelize";
import dotenv from "dotenv";

// npx ts-node migrate-add-isActive-lessons.ts

dotenv.config({ path: "../.env" });

const USERS_SERVICE_DB = process.env.USERS_SERVICE_DEV_DB!;

if (!USERS_SERVICE_DB) {
  console.error("❌ USERS_SERVICE_DB environment variable is not set");
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
  logging: false,
});

async function runMigration() {
  try {
    console.log("🔄 Starting migration: Add isActive to lessons table");
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");

    const tableDescription = await sequelize
      .getQueryInterface()
      .describeTable("lessons");

    if (tableDescription.isActive) {
      console.log("⚠️  isActive column already exists in lessons table");
      return;
    }

    console.log("📝 Adding isActive column to lessons table...");
    await sequelize.query(
      `ALTER TABLE lessons ADD COLUMN "isActive" BOOLEAN DEFAULT true`,
      { type: QueryTypes.RAW },
    );

    console.log("🔄 Backfilling existing lesson rows...");
    await sequelize.query(
      `UPDATE lessons SET "isActive" = true WHERE "isActive" IS NULL`,
      { type: QueryTypes.UPDATE },
    );

    console.log("🔒 Making isActive column NOT NULL...");
    await sequelize.query(
      `ALTER TABLE lessons ALTER COLUMN "isActive" SET NOT NULL`,
      { type: QueryTypes.RAW },
    );

    const [result] = (await sequelize.query(
      `SELECT COUNT(*) AS total, COUNT("isActive") AS with_is_active FROM lessons`,
      { type: QueryTypes.SELECT },
    )) as any[];

    console.log("📊 Migration verification:");
    console.log(`   - Total records: ${result.total}`);
    console.log(`   - Records with isActive: ${result.with_is_active}`);

    console.log("✅ Migration completed successfully");
  } catch (error: any) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sequelize.close();
    console.log("🔒 Database connection closed");
  }
}

runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
