import { founders_list_db, users_service_db, ededun_database } from './databases';


export async function syncDatabases() {
  try {
    console.log('📥 Registering models...');
    console.log('🔄 Syncing databases...');

    await Promise.all([
      founders_list_db.sync({}),
      users_service_db.sync({}),
      ededun_database.sync({})
    ]);
    console.log('✅ All databases synced successfully');
  } catch (error) {
    console.error('❌ Error syncing databases:', error);
    throw error;
  }
}