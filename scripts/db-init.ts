import config from "../config/config";
import { users_service_db } from "../config/databases";
import Users from "../shared/entities/user-service-entities/users/users.entities";
import Otp from "../shared/entities/user-service-entities/otp/otp.entities";

async function initAuthTables() {
  if (!config.USERS_SERVICE_DB) {
    throw new Error(
      "USERS_SERVICE_DB is not configured. Set USERS_SERVICE_PRODUCTION_DB (or environment-specific equivalent)."
    );
  }

  console.log("Connecting to users database...");
  await users_service_db.authenticate();
  console.log("Connected. Ensuring auth tables exist...");

  // Safe: sync without force/alter only creates missing objects.
  await Users.sync();
  await Otp.sync();

  console.log("Auth table initialization complete (users, otps).");
}

initAuthTables()
  .then(async () => {
    await users_service_db.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("db:init failed:", error);
    try {
      await users_service_db.close();
    } catch (_closeError) {
      // Ignore close errors during failure handling.
    }
    process.exit(1);
  });
