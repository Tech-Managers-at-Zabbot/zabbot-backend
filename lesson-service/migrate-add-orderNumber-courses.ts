import { QueryTypes, Sequelize } from "sequelize";
import dotenv from "dotenv";

// npx ts-node migrate-add-orderNumber-courses.ts

dotenv.config({ path: "../.env" });

const USERS_SERVICE_DB = process.env.USERS_SERVICE_DEV_DB!;

if (!USERS_SERVICE_DB) {
  console.error("❌ USERS_SERVICE_DEV_DB environment variable is not set");
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
    console.log("🔄 Starting migration: Add orderNumber to courses table");
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");

    const tableDescription = await sequelize
      .getQueryInterface()
      .describeTable("courses");

    if (tableDescription.orderNumber) {
      console.log("⚠️  orderNumber column already exists in courses table");
      return;
    }

    console.log("📝 Adding orderNumber column to courses table...");
    await sequelize.query(
      `ALTER TABLE courses ADD COLUMN "orderNumber" INTEGER DEFAULT 0`,
      { type: QueryTypes.RAW },
    );

    console.log("🔄 Backfilling existing course rows...");
    await sequelize.query(
      `UPDATE courses SET "orderNumber" = 0 WHERE "orderNumber" IS NULL`,
      { type: QueryTypes.UPDATE },
    );

    console.log("🔒 Making orderNumber column NOT NULL...");
    await sequelize.query(
      `ALTER TABLE courses ALTER COLUMN "orderNumber" SET NOT NULL`,
      { type: QueryTypes.RAW },
    );

    const [result] = (await sequelize.query(
      `SELECT COUNT(*) AS total, COUNT("orderNumber") AS with_order_number FROM courses`,
      { type: QueryTypes.SELECT },
    )) as any[];

    console.log("📊 Migration verification:");
    console.log(`   - Total records: ${result.total}`);
    console.log(`   - Records with orderNumber: ${result.with_order_number}`);

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
