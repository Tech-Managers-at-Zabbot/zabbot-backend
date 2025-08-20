import { QueryInterface, DataTypes, Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';

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
    console.log('🔄 Starting migration: Add languageId to Contents table');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Check if languageId column already exists
    const tableDescription = await queryInterface.describeTable('contents');
    
    if (tableDescription.languageId) {
      console.log('⚠️  languageId column already exists in contents table');
    } else {
      // Add the languageId column (removed 'after' property)
      console.log('📝 Adding languageId column to contents table...');
      await queryInterface.addColumn('contents', 'languageId', {
        type: DataTypes.UUID,
        allowNull: false
      });
      console.log('✅ languageId column added successfully');
    }
    
    // Get the single language ID from languages table
    console.log('🔍 Fetching language ID from languages table...');
    const [languages] = await sequelize.query(
      'SELECT id FROM languages LIMIT 1',
      { type: QueryTypes.SELECT }
    ) as any[];
    
    if (!languages || !languages.id) {
      throw new Error('No language found in languages table');
    }
    
    const languageId = languages.id;
    console.log(`📋 Found language ID: ${languageId}`);
    
    // Check how many contents records need updating
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM contents WHERE "languageId" IS NULL',
      { type: QueryTypes.SELECT }
    ) as any[];
    
    const recordsToUpdate = parseInt(countResult.count);
    console.log(`📊 Found ${recordsToUpdate} content records to update`);
    
    if (recordsToUpdate === 0) {
      console.log('✅ All content records already have languageId assigned');
    } else {
      // Update all content records with the language ID
      console.log('🔄 Updating all content records with languageId...');
      const [affectedRows] = await sequelize.query(
        'UPDATE contents SET "languageId" = :languageId WHERE "languageId" IS NULL',
        {
          replacements: { languageId },
          type: QueryTypes.UPDATE
        }
      );
      
      console.log(`✅ Updated ${affectedRows} content records with languageId: ${languageId}`);
    }
    
    // Verify the migration
    console.log('🔍 Verifying migration results...');
    const [verifyResult] = await sequelize.query(
      'SELECT COUNT(*) as total_records, COUNT("languageId") as records_with_language FROM contents',
      { type: QueryTypes.SELECT }
    ) as any[];
    
    console.log(`📊 Verification results:`);
    console.log(`   - Total content records: ${verifyResult.total_records}`);
    console.log(`   - Records with languageId: ${verifyResult.records_with_language}`);
    
    if (verifyResult.total_records === verifyResult.records_with_language) {
      console.log('✅ Migration completed successfully! All records have languageId assigned.');
    } else {
      console.warn('⚠️  Some records still missing languageId. Please check manually.');
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