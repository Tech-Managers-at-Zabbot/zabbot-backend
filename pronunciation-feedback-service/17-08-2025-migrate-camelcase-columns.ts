import { QueryInterface, DataTypes, Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';

//npx ts-node migrate-camelcase-columns.ts
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
    console.log('🔄 Starting migration: Convert reference_pronunciation columns to camelCase');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Check if table exists
    const tableDescription = await queryInterface.describeTable('reference_pronunciation');
    console.log('📋 Current table structure:', Object.keys(tableDescription));
    
    // Check current column state
    const englishWordSnakeExists = tableDescription.english_word;
    const yorubaWordSnakeExists = tableDescription.yoruba_word;
    const englishWordCamelExists = tableDescription.englishWord;
    const yorubaWordCamelExists = tableDescription.yorubaWord;
    
    // Check if migration has already been completed
    if (englishWordCamelExists && yorubaWordCamelExists && !englishWordSnakeExists && !yorubaWordSnakeExists) {
      console.log('⚠️  Migration appears to have already been completed - columns are already in camelCase');
      return;
    }
    
    // Check if we're in a partial migration state
    if (englishWordCamelExists || yorubaWordCamelExists) {
      console.log('⚠️  Partial migration detected - some camelCase columns already exist');
      console.log('    english_word exists:', !!englishWordSnakeExists);
      console.log('    englishWord exists:', !!englishWordCamelExists);
      console.log('    yoruba_word exists:', !!yorubaWordSnakeExists);
      console.log('    yorubaWord exists:', !!yorubaWordCamelExists);
    }
    
    // Verify we have the expected snake_case columns
    if (!englishWordSnakeExists || !yorubaWordSnakeExists) {
      throw new Error('❌ Expected snake_case columns (english_word, yoruba_word) not found. Cannot proceed with migration.');
    }
    
    // Get record count for verification
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM reference_pronunciation',
      { type: QueryTypes.SELECT }
    ) as any[];
    
    const totalRecords = parseInt(countResult.count);
    console.log(`📊 Found ${totalRecords} total records in reference_pronunciation table`);
    
    // Step 1: Add new camelCase columns (nullable initially)
    if (!englishWordCamelExists) {
      console.log('📝 Adding englishWord column (nullable) to reference_pronunciation table...');
      await queryInterface.addColumn('reference_pronunciation', 'englishWord', {
        type: DataTypes.STRING,
        allowNull: true
      });
      console.log('✅ englishWord column added successfully (nullable)');
    } else {
      console.log('⚠️  englishWord column already exists');
    }
    
    if (!yorubaWordCamelExists) {
      console.log('📝 Adding yorubaWord column (nullable) to reference_pronunciation table...');
      await queryInterface.addColumn('reference_pronunciation', 'yorubaWord', {
        type: DataTypes.STRING,
        allowNull: true
      });
      console.log('✅ yorubaWord column added successfully (nullable)');
    } else {
      console.log('⚠️  yorubaWord column already exists');
    }
    
    // Step 2: Copy data from snake_case to camelCase columns
    console.log('🔄 Copying data from snake_case to camelCase columns...');
    const [, affectedRows] = await sequelize.query(`
      UPDATE reference_pronunciation 
      SET 
        "englishWord" = english_word,
        "yorubaWord" = yoruba_word
      WHERE 
        (("englishWord" IS NULL OR "englishWord" = '') AND english_word IS NOT NULL) OR
        (("yorubaWord" IS NULL OR "yorubaWord" = '') AND yoruba_word IS NOT NULL)
    `, {
      type: QueryTypes.UPDATE
    });
    
    console.log(`✅ Copied data for ${affectedRows} records`);
    
    // Step 3: Verify data integrity
    console.log('🔍 Verifying data integrity...');
    const [integrityResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN english_word = "englishWord" THEN 1 END) as english_matches,
        COUNT(CASE WHEN yoruba_word = "yorubaWord" THEN 1 END) as yoruba_matches,
        COUNT(CASE WHEN english_word IS NULL AND "englishWord" IS NULL THEN 1 END) as english_both_null,
        COUNT(CASE WHEN yoruba_word IS NULL AND "yorubaWord" IS NULL THEN 1 END) as yoruba_both_null
      FROM reference_pronunciation
    `, { type: QueryTypes.SELECT }) as any[];
    
    console.log(`📊 Data integrity check:`);
    console.log(`   - Total records: ${integrityResult.total}`);
    console.log(`   - English values match: ${integrityResult.english_matches}`);
    console.log(`   - Yoruba values match: ${integrityResult.yoruba_matches}`);
    console.log(`   - English both null: ${integrityResult.english_both_null}`);
    console.log(`   - Yoruba both null: ${integrityResult.yoruba_both_null}`);
    
    // Verify all data has been copied correctly
    const expectedMatches = integrityResult.total;
    if (integrityResult.english_matches !== expectedMatches || integrityResult.yoruba_matches !== expectedMatches) {
      throw new Error('❌ Data integrity check failed - not all values were copied correctly');
    }
    
    // Step 4: Apply NOT NULL constraints to new columns (if old columns were NOT NULL)
    const englishWordConstraint = tableDescription.english_word.allowNull;
    const yorubaWordConstraint = tableDescription.yoruba_word.allowNull;
    
    if (!englishWordConstraint) {
      console.log('🔒 Making englishWord column NOT NULL...');
      await sequelize.query(
        'ALTER TABLE reference_pronunciation ALTER COLUMN "englishWord" SET NOT NULL',
        { type: QueryTypes.RAW }
      );
      console.log('✅ englishWord column is now NOT NULL');
    } else {
      console.log('ℹ️  englishWord column will remain nullable (original was nullable)');
    }
    
    if (!yorubaWordConstraint) {
      console.log('🔒 Making yorubaWord column NOT NULL...');
      await sequelize.query(
        'ALTER TABLE reference_pronunciation ALTER COLUMN "yorubaWord" SET NOT NULL',
        { type: QueryTypes.RAW }
      );
      console.log('✅ yorubaWord column is now NOT NULL');
    } else {
      console.log('ℹ️  yorubaWord column will remain nullable (original was nullable)');
    }
    
    // Step 5: Remove old snake_case columns
    console.log('🗑️  Removing old english_word column...');
    await queryInterface.removeColumn('reference_pronunciation', 'english_word');
    console.log('✅ english_word column removed successfully');
    
    console.log('🗑️  Removing old yoruba_word column...');
    await queryInterface.removeColumn('reference_pronunciation', 'yoruba_word');
    console.log('✅ yoruba_word column removed successfully');
    
    // Final verification
    console.log('🔍 Final verification...');
    const [finalResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_records, 
        COUNT("englishWord") as records_with_english,
        COUNT("yorubaWord") as records_with_yoruba,
        COUNT(CASE WHEN "englishWord" != '' THEN 1 END) as non_empty_english,
        COUNT(CASE WHEN "yorubaWord" != '' THEN 1 END) as non_empty_yoruba
      FROM reference_pronunciation
    `, { type: QueryTypes.SELECT }) as any[];
    
    console.log(`📊 Final verification results:`);
    console.log(`   - Total records: ${finalResult.total_records}`);
    console.log(`   - Records with englishWord: ${finalResult.records_with_english}`);
    console.log(`   - Records with yorubaWord: ${finalResult.records_with_yoruba}`);
    console.log(`   - Non-empty englishWord: ${finalResult.non_empty_english}`);
    console.log(`   - Non-empty yorubaWord: ${finalResult.non_empty_yoruba}`);
    
    // Show final table structure
    const finalTableDescription = await queryInterface.describeTable('reference_pronunciation');
    console.log('📋 Final table structure:', Object.keys(finalTableDescription));
    
    // Verify the old columns are gone and new ones exist
    const finalEnglishWordSnakeExists = finalTableDescription.english_word;
    const finalYorubaWordSnakeExists = finalTableDescription.yoruba_word;
    const finalEnglishWordCamelExists = finalTableDescription.englishWord;
    const finalYorubaWordCamelExists = finalTableDescription.yorubaWord;
    
    if (!finalEnglishWordSnakeExists && !finalYorubaWordSnakeExists && 
        finalEnglishWordCamelExists && finalYorubaWordCamelExists) {
      console.log('✅ Migration completed successfully! Columns have been renamed to camelCase.');
    } else {
      console.warn('⚠️  Migration may not have completed properly:');
      console.warn(`     - english_word exists: ${!!finalEnglishWordSnakeExists}`);
      console.warn(`     - englishWord exists: ${!!finalEnglishWordCamelExists}`);
      console.warn(`     - yoruba_word exists: ${!!finalYorubaWordSnakeExists}`);
      console.warn(`     - yorubaWord exists: ${!!finalYorubaWordCamelExists}`);
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