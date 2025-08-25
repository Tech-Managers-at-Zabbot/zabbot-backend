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
    console.log('🔄 Starting migration: Remove courseId unique constraint and add lessonId unique constraint');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Get all indexes and constraints for the user_courses table
    console.log('🔍 Fetching current constraints and indexes...');
    const constraints = await sequelize.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(c.oid) as constraint_definition
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      JOIN pg_namespace n ON t.relnamespace = n.oid
      WHERE t.relname = 'user_courses' 
      AND n.nspname = 'public'
      AND contype IN ('u', 'p')
      ORDER BY conname;
    `, { type: QueryTypes.SELECT }) as any[];
    
    console.log('📋 Current constraints:');
    constraints.forEach((constraint: any) => {
      console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_definition}`);
    });
    
    // Find and remove courseId unique constraints
    const courseIdConstraints = constraints.filter((c: any) => 
      c.constraint_name.includes('courseId') && c.constraint_type === 'u'
    );
    
    if (courseIdConstraints.length > 0) {
      for (const constraint of courseIdConstraints) {
        console.log(`🗑️  Dropping unique constraint: ${constraint.constraint_name}`);
        await sequelize.query(`ALTER TABLE user_courses DROP CONSTRAINT "${constraint.constraint_name}";`);
        console.log(`✅ Dropped constraint: ${constraint.constraint_name}`);
      }
    } else {
      console.log('ℹ️  No courseId unique constraints found to remove');
    }
    
    // Check if lastLessonId has any existing unique constraints
    const lessonIdConstraints = constraints.filter((c: any) => 
      c.constraint_name.includes('lastLessonId') && c.constraint_type === 'u'
    );
    
    if (lessonIdConstraints.length > 0) {
      console.log('⚠️  lastLessonId unique constraint already exists');
    } else {
      // Check for NULL values in lastLessonId before creating unique constraint
      console.log('🔍 Checking for NULL values in lastLessonId...');
      const [nullCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM user_courses WHERE "lastLessonId" IS NULL',
        { type: QueryTypes.SELECT }
      ) as any[];
      
      if (parseInt(nullCount.count) > 0) {
        console.log(`⚠️  Found ${nullCount.count} records with NULL lastLessonId`);
        console.log('❌ Cannot create unique constraint on column with NULL values');
        console.log('💡 You need to either:');
        console.log('   1. Update NULL values to valid UUIDs');
        console.log('   2. Use a partial unique index that excludes NULLs');
        console.log('   3. Make lastLessonId NOT NULL first');
        
        // Option: Create partial unique index (excludes NULL values)
        console.log('🔧 Creating partial unique index on lastLessonId (excluding NULLs)...');
        await sequelize.query(`
          CREATE UNIQUE INDEX CONCURRENTLY user_courses_lastLessonId_unique_idx 
          ON user_courses ("lastLessonId") 
          WHERE "lastLessonId" IS NOT NULL;
        `);
        console.log('✅ Created partial unique index on lastLessonId');
      } else {
        // Create unique constraint on lastLessonId
        console.log('🔧 Adding unique constraint on lastLessonId...');
        await queryInterface.addConstraint('user_courses', {
          fields: ['lastLessonId'],
          type: 'unique',
          name: 'user_courses_lastLessonId_unique'
        });
        console.log('✅ Added unique constraint on lastLessonId');
      }
    }
    
    // Verify the changes
    console.log('🔍 Verifying migration results...');
    const finalConstraints = await sequelize.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(c.oid) as constraint_definition
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      JOIN pg_namespace n ON t.relnamespace = n.oid
      WHERE t.relname = 'user_courses' 
      AND n.nspname = 'public'
      AND contype IN ('u', 'p')
      ORDER BY conname;
    `, { type: QueryTypes.SELECT }) as any[];
    
    console.log('📋 Final constraints:');
    finalConstraints.forEach((constraint: any) => {
      console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_definition}`);
    });
    
    // Check indexes as well
    const indexes = await sequelize.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'user_courses' 
      AND schemaname = 'public'
      ORDER BY indexname;
    `, { type: QueryTypes.SELECT }) as any[];
    
    console.log('📋 Current indexes:');
    indexes.forEach((index: any) => {
      console.log(`   - ${index.indexname}: ${index.indexdef}`);
    });
    
    console.log('✅ Migration completed successfully!');
    console.log('📝 Summary of changes:');
    console.log('   ✓ Removed unique constraint(s) on courseId');
    console.log('   ✓ Added unique constraint/index on lastLessonId');
    console.log('   ✓ Now multiple user_courses can have the same courseId');
    console.log('   ✓ Each lastLessonId can only appear once (when not NULL)');
    
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