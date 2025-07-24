import cron from 'node-cron';
import { dailyWordsServices } from '../lesson-service/src/services';

const LANGUAGE_IDS = [
    '6f4bd2a1-66ef-4cc3-8ef5-26a2dcc40f46'
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
