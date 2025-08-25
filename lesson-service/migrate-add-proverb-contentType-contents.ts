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
    console.log('🔄 Starting migration: FORCE REMOVE lastLessonId-only unique constraint');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // First, let's see what constraints and indexes exist
    console.log('🔍 Checking existing constraints...');
    const constraints = await sequelize.query(`
      SELECT constraint_name, constraint_type, table_name
      FROM information_schema.table_constraints 
      WHERE table_name = 'user_courses' 
      AND constraint_type = 'UNIQUE'
      ORDER BY constraint_name;
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 Current unique constraints:', JSON.stringify(constraints, null, 2));
    
    console.log('🔍 Checking existing indexes...');
    const indexes = await sequelize.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'user_courses'
      ORDER BY indexname;
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 Current indexes:', JSON.stringify(indexes, null, 2));
    
    // AGGRESSIVELY remove ALL possible variations of the problematic constraint
    const constraintsToRemove = [
      'user_courses_lastLessonId_unique',
      'user_courses_lastLessonId_key',
      'user_courses_lastLessonId_pkey'
    ];
    
    for (const constraintName of constraintsToRemove) {
      console.log(`🗑️ Attempting to remove constraint: ${constraintName}`);
      try {
        await sequelize.query(`ALTER TABLE user_courses DROP CONSTRAINT IF EXISTS "${constraintName}" CASCADE;`);
        console.log(`✅ Removed constraint: ${constraintName}`);
      } catch (error: any) {
        console.log(`ℹ️ Constraint ${constraintName} not found or already removed:`, error.message);
      }
    }
    
    // AGGRESSIVELY remove ALL possible variations of the problematic index
    const indexesToRemove = [
      'user_courses_lastLessonId_unique',
      'user_courses_lastLessonId_key',
      'user_courses_lastLessonId_idx',
      'user_courses_lastLessonId_pkey'
    ];
    
    for (const indexName of indexesToRemove) {
      console.log(`🗑️ Attempting to remove index: ${indexName}`);
      try {
        await sequelize.query(`DROP INDEX IF EXISTS "${indexName}" CASCADE;`);
        console.log(`✅ Removed index: ${indexName}`);
      } catch (error: any) {
        console.log(`ℹ️ Index ${indexName} not found or already removed:`, error.message);
      }
    }
    
    // Now let's check what's left
    console.log('🔍 Checking remaining constraints after removal...');
    const remainingConstraints = await sequelize.query(`
      SELECT constraint_name, constraint_type, table_name
      FROM information_schema.table_constraints 
      WHERE table_name = 'user_courses' 
      AND constraint_type = 'UNIQUE'
      ORDER BY constraint_name;
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 Remaining unique constraints:', JSON.stringify(remainingConstraints, null, 2));
    
    console.log('🔍 Checking remaining indexes...');
    const remainingIndexes = await sequelize.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'user_courses'
      ORDER BY indexname;
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 Remaining indexes:', JSON.stringify(remainingIndexes, null, 2));
    
    // Now create the correct composite unique constraint
    console.log('🔧 Creating correct composite unique constraint...');
    try {
      await sequelize.query(`
        CREATE UNIQUE INDEX user_courses_userId_lastLessonId_unique_idx 
        ON user_courses ("userId", "lastLessonId") 
        WHERE "lastLessonId" IS NOT NULL;
      `);
      console.log('✅ Added unique constraint on userId+lastLessonId');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ userId+lastLessonId unique constraint already exists');
      } else {
        console.error('❌ Failed to create composite constraint:', error.message);
        throw error;
      }
    }
    
    // Final verification
    console.log('🔍 Final verification of constraints...');
    const finalConstraints = await sequelize.query(`
      SELECT constraint_name, constraint_type, table_name
      FROM information_schema.table_constraints 
      WHERE table_name = 'user_courses' 
      AND constraint_type = 'UNIQUE'
      ORDER BY constraint_name;
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 Final unique constraints:', JSON.stringify(finalConstraints, null, 2));
    
    const finalIndexes = await sequelize.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'user_courses'
      AND indexname LIKE '%lastLessonId%'
      ORDER BY indexname;
    `, { type: QueryTypes.SELECT });
    
    console.log('📋 Final lastLessonId indexes:', JSON.stringify(finalIndexes, null, 2));
    
    console.log('✅ Migration completed successfully');
    
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