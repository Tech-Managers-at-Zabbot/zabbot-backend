import { founders_list_db, users_service_db } from './databases';

export async function syncDatabases() {
  try {
    await Promise.all([
      founders_list_db.sync({ alter: true }),
      users_service_db.sync({ alter: true }),
    ]);
    console.log('✅ All databases synced successfully');
  } catch (error) {
    console.error('❌ Error syncing databases:', error);
    throw error;
  }
}