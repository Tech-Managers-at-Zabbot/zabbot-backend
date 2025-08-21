import { QueryInterface, DataTypes, Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';


//npx ts-node migrate-add-languageId-lessons.ts
// Load environment variables
dotenv.config({ path: '../.env' });

// Database configuration
const USERS_SERVICE_DB = process.env.USERS_SERVICE_DEV_DB!;

if (!USERS_SERVICE_DB) {
  console.error('❌ USERS_SERVICE_DB environment variable is not set');
  process.exit(1);
}

const sequelize = new Sequelize(USERS_SERVICE_DB, {
  dialect: 'postgres',
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
    }
  },
  logging: console.log
});

async function runMigration() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('🔄 Starting migration: Add languageId to Lessons table');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Check if languageId column already exists
    const tableDescription = await queryInterface.describeTable('lessons');
    
    if (tableDescription.languageId) {
      console.log('⚠️  languageId column already exists in lessons table');
    } else {
      // Step 1: Add the languageId column as NULLABLE first
      console.log('📝 Adding languageId column (nullable) to lessons table...');
      await queryInterface.addColumn('lessons', 'languageId', {
        type: DataTypes.UUID,
        allowNull: true // Initially allow null
      });
      console.log('✅ languageId column added successfully (nullable)');
    }
    
    // Get the single language ID from languages table
    console.log('🔍 Fetching language ID from languages table...');
    const [languages] = await sequelize.query(
      'SELECT id FROM languages LIMIT 1',
      { type: QueryTypes.SELECT }
    ) as any[];
    
    if (!languages || !languages.id) {
      throw new Error('No language found in languages table. Please ensure at least one language exists.');
    }
    
    const languageId = languages.id;
    console.log(`📋 Found language ID: ${languageId}`);
    
    // Check how many lessons records need updating
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM lessons WHERE "languageId" IS NULL',
      { type: QueryTypes.SELECT }
    ) as any[];
    
    const recordsToUpdate = parseInt(countResult.count);
    console.log(`📊 Found ${recordsToUpdate} lesson records to update`);
    
    if (recordsToUpdate === 0) {
      console.log('✅ All lesson records already have languageId assigned');
    } else {
      // Step 2: Update all lessons records with the language ID
      console.log('🔄 Updating all lesson records with languageId...');
      const [, affectedRows] = await sequelize.query(
        'UPDATE lessons SET "languageId" = :languageId WHERE "languageId" IS NULL',
        {
          replacements: { languageId },
          type: QueryTypes.UPDATE
        }
      );
      
      console.log(`✅ Updated ${affectedRows} lesson records with languageId: ${languageId}`);
    }
    
    // Step 3: Verify all records have languageId before making it NOT NULL
    console.log('🔍 Verifying all records have languageId...');
    const [nullCheckResult] = await sequelize.query(
      'SELECT COUNT(*) as null_count FROM lessons WHERE "languageId" IS NULL',
      { type: QueryTypes.SELECT }
    ) as any[];
    
    const nullCount = parseInt(nullCheckResult.null_count);
    
    if (nullCount > 0) {
      throw new Error(`Still have ${nullCount} records with NULL languageId. Cannot proceed with NOT NULL constraint.`);
    }
    
    // Step 4: Alter the column to be NOT NULL
    console.log('🔒 Making languageId column NOT NULL...');
    await sequelize.query(
      'ALTER TABLE lessons ALTER COLUMN "languageId" SET NOT NULL',
      { type: QueryTypes.RAW }
    );
    console.log('✅ languageId column is now NOT NULL');
    
    // Final verification
    console.log('🔍 Final verification...');
    const [verifyResult] = await sequelize.query(
      'SELECT COUNT(*) as total_records, COUNT("languageId") as records_with_language FROM lessons',
      { type: QueryTypes.SELECT }
    ) as any[];
    
    console.log(`📊 Final verification results:`);
    console.log(`   - Total lesson records: ${verifyResult.total_records}`);
    console.log(`   - Records with languageId: ${verifyResult.records_with_language}`);
    
    if (verifyResult.total_records === verifyResult.records_with_language) {
      console.log('✅ Migration completed successfully! All records have languageId assigned and column is NOT NULL.');
    } else {
      console.warn('⚠️  Some records still missing languageId. This should not happen.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('🎉 Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });