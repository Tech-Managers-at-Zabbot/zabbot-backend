"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDatabases = syncDatabases;
const databases_1 = require("./databases");
async function syncDatabases() {
    try {
        await Promise.all([
            databases_1.founders_list_db.sync({ alter: true }),
            databases_1.users_service_db.sync({ alter: true }),
        ]);
        console.log('✅ All databases synced successfully');
    }
    catch (error) {
        console.error('❌ Error syncing databases:', error);
        throw error;
    }
}
