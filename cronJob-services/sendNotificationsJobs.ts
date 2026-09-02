import cron from "node-cron";
import { Op } from "sequelize";
import userNotificationsRepositories from "../shared/repositories/userNotification.repositories";
import userRepositories from "../user-service/src/repositories/userRepositories/users.repositories";
import { NotificationFrequency } from "../shared/entities/user-service-entities/userNotificationSettings/userNotificationSettings.entities";
import { calculateNextNotificationDate } from "../user-service/src/services/userNotificationsServices/userNotifications.services";
import { sendgridMailServices } from "../notification-service/src/services";

// Main cron job function
const processDueNotifications = async () => {
  try {
    console.log(
      "🔔 Starting notification processing at:",
      new Date().toISOString()
    );

    const now = new Date();
    const todayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);

    // Get all due notifications for users who have at least one reminder type
    // enabled and have not opted out of all notifications
    const dueNotifications = await userNotificationsRepositories.getMany({
      nextNotificationDate: {
        [Op.lt]: tomorrowUTC,
      },
      frequency: {
        [Op.ne]: "never",
      },
      noNotificationsAndReminders: false,
      [Op.or]: [
        { dailyReminders: true },
        { weeklyReminders: true },
        { biWeeklyReminders: true },
      ],
    });

    if (!dueNotifications || dueNotifications.length === 0) {
      console.log("✅ No notifications due today");
      return;
    }

    console.log(`📧 Found ${dueNotifications.length} notifications to send`);

    // Get user IDs
    const userIds = dueNotifications.map((notification) => notification.userId);

    // Fetch all users
    const users = await userRepositories.getMany({
      id: {
        [Op.in]: userIds,
      },
    });

    if (!users || users.length === 0) {
      console.log("⚠️ No users found for due notifications");
      return;
    }

    // Create a map of userId to user for easy lookup
    const userMap = new Map(users.map((user) => [user.id, user]));

    // Process each notification
    let successCount = 0;
    let failureCount = 0;

    for (const notification of dueNotifications) {
      const user = userMap.get(notification.userId);

      if (!user) {
        console.log(
          `⚠️ User not found for notification: ${notification.userId}`
        );
        failureCount++;
        continue;
      }

      try {
        // Send the notification email
        await sendgridMailServices.sendFrequentNotificationService(
          user.email,
          user.firstName,
          user.id
        );

        // Update lastNotificationDate and nextNotificationDate
        const now = new Date();
        await userNotificationsRepositories.updateOne(
          { userId: notification.userId },
          {
            lastNotificationDate: now,
            nextNotificationDate: calculateNextNotificationDate(
              notification.frequency as NotificationFrequency
            ),
          }
        );
        successCount++;
        console.log(`✅ Notification sent to ${user.email}`);

        // Add a small delay to avoid overwhelming the email service
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error: any) {
        failureCount++;
        console.error(
          `❌ Failed to send notification to ${user.email}:`,
          error.message
        );
      }
    }

    console.log(`\n📊 Notification processing completed:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📅 Total: ${dueNotifications.length}\n`);
  } catch (error: any) {
    console.error("❌ Error in notification cron job:", error.message);
  }
};

// Schedule the cron job to run daily at 9:00 AM
// Cron format: second minute hour day month dayOfWeek
export const startNotificationCron = () => {
  // Run at 9:00 AM every day
  cron.schedule("0 9 * * *", processDueNotifications, {
    timezone: "Africa/Lagos", // Change this to your timezone
  });

  console.log("✅ Notification cron job scheduled to run daily at 9:00 AM");
};

// For testing: run immediately
export const testNotificationCron = async () => {
  console.log("🧪 Running notification cron job manually for testing...");
  await processDueNotifications();
};

export default {
  startNotificationCron,
  testNotificationCron,
  processDueNotifications,
};
