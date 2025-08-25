import { QueryInterface, DataTypes, Sequelize, QueryTypes } from "sequelize";
import dotenv from "dotenv";

//npx ts-node migrate-add-grammar-fields.ts
// Load environment variables
dotenv.config({ path: "../.env" });

// Database configuration
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
  logging: console.log,
});

// Define ContentType enum values (matching your ContentType enum)
const ContentTypeValues = ["grammar_rule", "proverb", "normal"];

async function runMigration() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log(
      "🔄 Starting migration: Add grammar fields to Contents table"
    );

    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");

    // Check current table structure
    const tableDescription = await queryInterface.describeTable("contents");
    console.log("📋 Current table structure checked");

    // Step 1: Add proverb column if it doesn't exist
    if (tableDescription.proverb) {
      console.log("⚠️  proverb column already exists in contents table");
    } else {
      console.log("📝 Adding proverb column to contents table...");
      await queryInterface.addColumn("contents", "proverb", {
        type: DataTypes.TEXT,
        allowNull: true,
      });
      console.log("✅ proverb column added successfully");
    }

    // Step 2: Add grammarTitle column if it doesn't exist
    if (tableDescription.grammarTitle) {
      console.log("⚠️  grammarTitle column already exists in contents table");
    } else {
      console.log("📝 Adding grammarTitle column to contents table...");
      await queryInterface.addColumn("contents", "grammarTitle", {
        type: DataTypes.TEXT,
        allowNull: true,
      });
      console.log("✅ grammarTitle column added successfully");
    }

    // Step 3: Add grammarSubtitle column if it doesn't exist
    if (tableDescription.grammarSubtitle) {
      console.log("⚠️  grammarSubtitle column already exists in contents table");
    } else {
      console.log("📝 Adding grammarSubtitle column to contents table...");
      await queryInterface.addColumn("contents", "grammarSubtitle", {
        type: DataTypes.TEXT,
        allowNull: true,
      });
      console.log("✅ grammarSubtitle column added successfully");
    }

    // Step 4: Add grammarDescription column if it doesn't exist
    if (tableDescription.grammarDescription) {
      console.log("⚠️  grammarDescription column already exists in contents table");
    } else {
      console.log("📝 Adding grammarDescription column to contents table...");
      await queryInterface.addColumn("contents", "grammarDescription", {
        type: DataTypes.JSON,
        allowNull: true,
      });
      console.log("✅ grammarDescription column added successfully");
    }

    // Step 5: Add grammarExamples column if it doesn't exist
    if (tableDescription.grammarExamples) {
      console.log("⚠️  grammarExamples column already exists in contents table");
    } else {
      console.log("📝 Adding grammarExamples column to contents table...");
      await queryInterface.addColumn("contents", "grammarExamples", {
        type: DataTypes.JSON,
        allowNull: true,
      });
      console.log("✅ grammarExamples column added successfully");
    }

    // Step 6: Create contentType ENUM type if it doesn't exist
    console.log("📝 Creating contentType ENUM type...");
    try {
      await sequelize.query(
        `
        DO $$ BEGIN
          CREATE TYPE "enum_contents_contentType" AS ENUM (${ContentTypeValues.map(
            (v) => `'${v}'`
          ).join(", ")});
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `,
        { type: QueryTypes.RAW }
      );
      console.log("✅ contentType ENUM type created or already exists");
    } catch (error) {
      console.log(
        "⚠️  contentType ENUM type might already exist, continuing..."
      );
    }

    // Step 7: Add contentType column if it doesn't exist
    if (tableDescription.contentType) {
      console.log("⚠️  contentType column already exists in contents table");
    } else {
      console.log("📝 Adding contentType column to contents table...");
      await queryInterface.addColumn("contents", "contentType", {
        type: DataTypes.ENUM(...ContentTypeValues),
        allowNull: true, // Initially allow null
      });
      console.log("✅ contentType column added successfully (nullable)");
    }

    // Step 8: Check how many content records need updating for contentType
    const [countResult] = (await sequelize.query(
      'SELECT COUNT(*) as count FROM contents WHERE "contentType" IS NULL',
      { type: QueryTypes.SELECT }
    )) as any[];

    const recordsToUpdate = parseInt(countResult.count);
    console.log(
      `📊 Found ${recordsToUpdate} content records to update with default contentType`
    );

    if (recordsToUpdate === 0) {
      console.log("✅ All content records already have contentType assigned");
    } else {
      // Step 9: Update all content records with default contentType value
      console.log(
        "🔄 Updating all content records with default contentType (NORMAL)..."
      );
      const [, affectedRows] = await sequelize.query(
        'UPDATE contents SET "contentType" = :defaultContentType WHERE "contentType" IS NULL',
        {
          replacements: { defaultContentType: "normal" }, // Using 'normal' as default to match your enum
          type: QueryTypes.UPDATE,
        }
      );

      console.log(
        `✅ Updated ${affectedRows} content records with default contentType: normal`
      );
    }

    // Step 10: Verify all records have contentType before making it NOT NULL
    console.log("🔍 Verifying all records have contentType...");
    const [nullCheckResult] = (await sequelize.query(
      'SELECT COUNT(*) as null_count FROM contents WHERE "contentType" IS NULL',
      { type: QueryTypes.SELECT }
    )) as any[];

    const nullCount = parseInt(nullCheckResult.null_count);

    if (nullCount > 0) {
      throw new Error(
        `Still have ${nullCount} records with NULL contentType. Cannot proceed with NOT NULL constraint.`
      );
    }

    // Step 11: Alter the contentType column to be NOT NULL
    console.log("🔒 Making contentType column NOT NULL...");
    await sequelize.query(
      'ALTER TABLE contents ALTER COLUMN "contentType" SET NOT NULL',
      { type: QueryTypes.RAW }
    );
    console.log("✅ contentType column is now NOT NULL");

    // Step 12: Set default value for contentType column
    console.log("📝 Setting default value for contentType column...");
    await sequelize.query(
      "ALTER TABLE contents ALTER COLUMN \"contentType\" SET DEFAULT 'normal'",
      { type: QueryTypes.RAW }
    );
    console.log("✅ Default value set for contentType column");

    // Final verification
    console.log("🔍 Final verification...");
    const [verifyResult] = (await sequelize.query(
      `SELECT 
        COUNT(*) as total_records, 
        COUNT("contentType") as records_with_contentType,
        COUNT("proverb") as records_with_proverb_field,
        COUNT(CASE WHEN "proverb" IS NOT NULL THEN 1 END) as records_with_proverb_value,
        COUNT("grammarTitle") as records_with_grammarTitle_field,
        COUNT(CASE WHEN "grammarTitle" IS NOT NULL THEN 1 END) as records_with_grammarTitle_value,
        COUNT("grammarSubtitle") as records_with_grammarSubtitle_field,
        COUNT(CASE WHEN "grammarSubtitle" IS NOT NULL THEN 1 END) as records_with_grammarSubtitle_value,
        COUNT("grammarDescription") as records_with_grammarDescription_field,
        COUNT(CASE WHEN "grammarDescription" IS NOT NULL THEN 1 END) as records_with_grammarDescription_value,
        COUNT("grammarExamples") as records_with_grammarExamples_field,
        COUNT(CASE WHEN "grammarExamples" IS NOT NULL THEN 1 END) as records_with_grammarExamples_value
       FROM contents`,
      { type: QueryTypes.SELECT }
    )) as any[];

    console.log(`📊 Final verification results:`);
    console.log(`   - Total content records: ${verifyResult.total_records}`);
    console.log(
      `   - Records with contentType: ${verifyResult.records_with_contentType}`
    );
    console.log(
      `   - Records with proverb field: ${verifyResult.records_with_proverb_field}`
    );
    console.log(
      `   - Records with actual proverb values: ${verifyResult.records_with_proverb_value}`
    );
    console.log(
      `   - Records with grammarTitle field: ${verifyResult.records_with_grammarTitle_field}`
    );
    console.log(
      `   - Records with actual grammarTitle values: ${verifyResult.records_with_grammarTitle_value}`
    );
    console.log(
      `   - Records with grammarSubtitle field: ${verifyResult.records_with_grammarSubtitle_field}`
    );
    console.log(
      `   - Records with actual grammarSubtitle values: ${verifyResult.records_with_grammarSubtitle_value}`
    );
    console.log(
      `   - Records with grammarDescription field: ${verifyResult.records_with_grammarDescription_field}`
    );
    console.log(
      `   - Records with actual grammarDescription values: ${verifyResult.records_with_grammarDescription_value}`
    );
    console.log(
      `   - Records with grammarExamples field: ${verifyResult.records_with_grammarExamples_field}`
    );
    console.log(
      `   - Records with actual grammarExamples values: ${verifyResult.records_with_grammarExamples_value}`
    );

    if (verifyResult.total_records === verifyResult.records_with_contentType) {
      console.log(
        "✅ Migration completed successfully! All records have contentType assigned and all new columns are properly configured."
      );
    } else {
      console.warn(
        "⚠️  Some records still missing contentType. This should not happen."
      );
    }

    // Show sample of contentType distribution
    console.log("📊 ContentType distribution:");
    const [distributionResult] = (await sequelize.query(
      'SELECT "contentType", COUNT(*) as count FROM contents GROUP BY "contentType" ORDER BY count DESC',
      { type: QueryTypes.SELECT }
    )) as any[];

    if (Array.isArray(distributionResult)) {
      distributionResult.forEach((row: any) => {
        console.log(`   - ${row.contentType}: ${row.count} records`);
      });
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    // Close database connection
    await sequelize.close();
    console.log("🔒 Database connection closed");
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log("🎉 Migration script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration script failed:", error);
    process.exit(1);
  });