import { QueryInterface, DataTypes, Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';

//npx ts-node migrate-update-reference-pronunciation.ts
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
    console.log('🔄 Starting migration: Update reference_pronunciation table structure');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Check if table exists
    const tableDescription = await queryInterface.describeTable('reference_pronunciation');
    console.log('📋 Current table structure:', Object.keys(tableDescription));
    
    // Check if new columns already exist
    const englishWordExists = tableDescription.english_word;
    const yorubaWordExists = tableDescription.yoruba_word;
    const wordColumnExists = tableDescription.word;
    
    if (englishWordExists && yorubaWordExists && !wordColumnExists) {
      console.log('⚠️  Migration appears to have already been completed');
      return;
    }
    
    // Step 1: Add new columns as NULLABLE first
    if (!englishWordExists) {
      console.log('📝 Adding english_word column (nullable) to reference_pronunciation table...');
      await queryInterface.addColumn('reference_pronunciation', 'english_word', {
        type: DataTypes.STRING,
        allowNull: true // Initially allow null
      });
      console.log('✅ english_word column added successfully (nullable)');
    } else {
      console.log('⚠️  english_word column already exists');
    }
    
    if (!yorubaWordExists) {
      console.log('📝 Adding yoruba_word column (nullable) to reference_pronunciation table...');
      await queryInterface.addColumn('reference_pronunciation', 'yoruba_word', {
        type: DataTypes.STRING,
        allowNull: true // Initially allow null
      });
      console.log('✅ yoruba_word column added successfully (nullable)');
    } else {
      console.log('⚠️  yoruba_word column already exists');
    }
    
    // Step 2: Migrate data from word column if it exists
    if (wordColumnExists) {
      // Check how many records need updating
      const [countResult] = await sequelize.query(
        'SELECT COUNT(*) as count FROM reference_pronunciation WHERE word IS NOT NULL AND word != \'\'',
        { type: QueryTypes.SELECT }
      ) as any[];
      
      const recordsToUpdate = parseInt(countResult.count);
      console.log(`📊 Found ${recordsToUpdate} records with data in word column`);
      
      if (recordsToUpdate > 0) {
        console.log('🔄 Migrating data from word column to new columns...');
        const [, affectedRows] = await sequelize.query(`
          UPDATE reference_pronunciation 
          SET 
            english_word = CASE 
              WHEN (english_word IS NULL OR english_word = '') AND word IS NOT NULL AND word != '' 
              THEN word 
              ELSE COALESCE(english_word, '') 
            END,
            yoruba_word = CASE 
              WHEN (yoruba_word IS NULL OR yoruba_word = '') AND word IS NOT NULL AND word != '' 
              THEN word 
              ELSE COALESCE(yoruba_word, '') 
            END
          WHERE word IS NOT NULL AND word != ''
        `, {
          type: QueryTypes.UPDATE
        });
        
        console.log(`✅ Migrated data for ${affectedRows} records`);
      }
      
      // Step 3: Remove the old word column
      console.log('🗑️  Removing old word column...');
      await queryInterface.removeColumn('reference_pronunciation', 'word');
      console.log('✅ word column removed successfully');
    } else {
      console.log('⚠️  word column does not exist, skipping data migration');
    }
    
    // Step 4: Set default values for any remaining NULL values
    console.log('🔄 Setting default values for any NULL entries...');
    await sequelize.query(`
      UPDATE reference_pronunciation 
      SET 
        english_word = COALESCE(english_word, ''),
        yoruba_word = COALESCE(yoruba_word, '')
      WHERE english_word IS NULL OR yoruba_word IS NULL
    `, { type: QueryTypes.UPDATE });
    
    // Step 5: Verify all records have required values before making columns NOT NULL
    console.log('🔍 Verifying all records have required values...');
    const [nullCheckResult] = await sequelize.query(
      'SELECT COUNT(*) as null_count FROM reference_pronunciation WHERE english_word IS NULL OR yoruba_word IS NULL',
      { type: QueryTypes.SELECT }
    ) as any[];
    
    const nullCount = parseInt(nullCheckResult.null_count);
    
    if (nullCount > 0) {
      throw new Error(`Still have ${nullCount} records with NULL values. Cannot proceed with NOT NULL constraint.`);
    }
    
    // Step 6: Alter the columns to be NOT NULL
    console.log('🔒 Making english_word column NOT NULL...');
    await sequelize.query(
      'ALTER TABLE reference_pronunciation ALTER COLUMN english_word SET NOT NULL',
      { type: QueryTypes.RAW }
    );
    console.log('✅ english_word column is now NOT NULL');
    
    console.log('🔒 Making yoruba_word column NOT NULL...');
    await sequelize.query(
      'ALTER TABLE reference_pronunciation ALTER COLUMN yoruba_word SET NOT NULL',
      { type: QueryTypes.RAW }
    );
    console.log('✅ yoruba_word column is now NOT NULL');
    
    // Final verification
    console.log('🔍 Final verification...');
    const [verifyResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_records, 
        COUNT(english_word) as records_with_english,
        COUNT(yoruba_word) as records_with_yoruba,
        COUNT(CASE WHEN english_word != '' THEN 1 END) as non_empty_english,
        COUNT(CASE WHEN yoruba_word != '' THEN 1 END) as non_empty_yoruba
      FROM reference_pronunciation
    `, { type: QueryTypes.SELECT }) as any[];
    
    console.log(`📊 Final verification results:`);
    console.log(`   - Total records: ${verifyResult.total_records}`);
    console.log(`   - Records with english_word: ${verifyResult.records_with_english}`);
    console.log(`   - Records with yoruba_word: ${verifyResult.records_with_yoruba}`);
    console.log(`   - Non-empty english_word: ${verifyResult.non_empty_english}`);
    console.log(`   - Non-empty yoruba_word: ${verifyResult.non_empty_yoruba}`);
    
    if (verifyResult.total_records === verifyResult.records_with_english && 
        verifyResult.total_records === verifyResult.records_with_yoruba) {
      console.log('✅ Migration completed successfully! All records have required columns and constraints are applied.');
    } else {
      console.warn('⚠️  Some records still missing required values. This should not happen.');
    }
    
    // Show final table structure
    const finalTableDescription = await queryInterface.describeTable('reference_pronunciation');
    console.log('📋 Final table structure:', Object.keys(finalTableDescription));
    
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