"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const services_1 = require("../lesson-service/src/services");
const config_1 = __importDefault(require("../config/config"));
const LANGUAGE_IDS = [
    config_1.default.YORUBA_LANGUAGE_ID
];
const LANGUAGES = {
    [config_1.default.YORUBA_LANGUAGE_ID]: "Yoruba"
};
const pickWordOfTheDay = async () => {
    console.log(`[${new Date().toISOString()}] ⏳ Starting daily word selection...`);
    for (const languageId of LANGUAGE_IDS) {
        try {
            await services_1.dailyWordsServices.getTodayWordService(languageId);
            console.log(`✅ Word picked for language ${LANGUAGES[languageId]}`);
        }
        catch (error) {
            console.error(`❌ Failed for ${LANGUAGES[languageId]}:`, error.message);
        }
    }
    console.log(`[${new Date().toISOString()}] ✅ Daily word selection finished.`);
};
node_cron_1.default.schedule('0 0 * * *', async () => {
    await pickWordOfTheDay();
});
(async () => {
    await pickWordOfTheDay();
})();
