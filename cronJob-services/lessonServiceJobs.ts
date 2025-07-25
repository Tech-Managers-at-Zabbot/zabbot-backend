import cron from 'node-cron';
import { dailyWordsServices } from '../lesson-service/src/services';
import config from '../config/config';

const LANGUAGE_IDS = [
    config.YORUBA_LANGUAGE_ID!
];

const pickWordOfTheDay = async () => {
    console.log(`[${new Date().toISOString()}] ⏳ Starting daily word selection...`);

    for (const languageId of LANGUAGE_IDS) {
        try {
            await dailyWordsServices.getTodayWordService(languageId);
            console.log(`✅ Word picked for language ${languageId}`);
        } catch (error: any) {
            console.error(`❌ Failed for ${languageId}:`, error.message);
        }
    }
    console.log(`[${new Date().toISOString()}] ✅ Daily word selection finished.`);
};

// 🔁 Schedule it to run every day at 00:00 (midnight) UTC
cron.schedule('0 0 * * *', async () => {
    await pickWordOfTheDay();
});

// Optional: Run once immediately on app start
// (async () => {
//     await pickWordOfTheDay();
// })();
