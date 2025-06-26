import { founders_list_db, users_service_db } from './databases';
// import "../user-service/src/entities/users.entities";

export async function syncDatabases() {
  try {
    console.log('📥 Registering models...');
    // ⬆️ import lines above must come first

    console.log('🔄 Syncing databases...');
    await Promise.all([
      founders_list_db.sync({}),
      users_service_db.sync({}),
    ]);
    console.log('✅ All databases synced successfully');
  } catch (error) {
    console.error('❌ Error syncing databases:', error);
    throw error;
  }
}