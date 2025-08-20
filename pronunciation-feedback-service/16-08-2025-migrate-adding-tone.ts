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
    console.log('🔄 Starting migration: Add tone column to reference_pronunciation table');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Check if table exists
    const tableDescription = await queryInterface.describeTable('reference_pronunciation');
    console.log('📋 Current table structure:', Object.keys(tableDescription));
    
    // Check if tone column already exists
    const toneColumnExists = tableDescription.tone;
    
    if (toneColumnExists) {
      console.log('⚠️  tone column already exists, migration appears to have already been completed');
      return;
    }
    
    // Add tone column
    console.log('📝 Adding tone column to reference_pronunciation table...');
    await queryInterface.addColumn('reference_pronunciation', 'tone', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    });
    console.log('✅ tone column added successfully');
    
    // Final verification
    console.log('🔍 Final verification...');
    const finalTableDescription = await queryInterface.describeTable('reference_pronunciation');
    console.log('📋 Final table structure:', Object.keys(finalTableDescription));
    
    if (finalTableDescription.tone) {
      console.log('✅ Migration completed successfully! tone column has been added.');
    } else {
      console.warn('⚠️  tone column was not found after adding. This should not happen.');
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