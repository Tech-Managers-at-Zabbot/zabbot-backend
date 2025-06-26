"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDatabases = syncDatabases;
const databases_1 = require("./databases");
async function syncDatabases() {
    try {
        console.log('📥 Registering models...');
        console.log('🔄 Syncing databases...');
        await Promise.all([
            databases_1.founders_list_db.sync({}),
            databases_1.users_service_db.sync({}),
        ]);
        console.log('✅ All databases synced successfully');
    }
    catch (error) {
        console.error('❌ Error syncing databases:', error);
        throw error;
    }
}
