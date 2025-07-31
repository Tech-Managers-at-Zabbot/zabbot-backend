"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wordForTheDay_repository_1 = __importDefault(require("../../repositories/wordForTheDay.repository"));
const utilities_1 = require("../../../../shared/utilities");
const uuid_1 = require("uuid");
const language_repository_1 = __importDefault(require("../../repositories/language.repository"));
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const responses_1 = require("../../responses/responses");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const sequelize_1 = require("sequelize");
const axiosCalls_1 = require("../../utilities/axiosCalls");
dayjs_1.default.extend(utc_1.default);
const createWordForTheDayService = utilities_1.errorUtilities.withServiceErrorHandling(async (wordData) => {
    const { languageId, audioUrls, languageText, englishText, pronunciationNote } = wordData;
    // const languageCheck = await languageRepositories.getLanguage(languageId)
    // if (!languageCheck) {
    //     throw errorUtilities.createError(
    //         LanguageResponses.NOT_FOUND,
    //         StatusCodes.NotFound
    //     );
    // }
    const existingWord = await wordForTheDay_repository_1.default.getOne({ languageText, englishText });
    if (existingWord) {
        throw utilities_1.errorUtilities.createError(responses_1.DailyWordResponses.ALREADY_EXISTS, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    const createDailyWordData = {
        id: (0, uuid_1.v4)(),
        languageId,
        dateUsed: null,
        audioUrls,
        languageText,
        englishText,
        pronunciationNote,
        isActive: true,
        isUsed: false
    };
    const createdWord = await wordForTheDay_repository_1.default.create(createDailyWordData);
    if (!createdWord) {
        throw utilities_1.errorUtilities.createError(responses_1.DailyWordResponses.UNABLE_TO_CREATE, statusCodes_responses_1.StatusCodes.NotImplemented);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, responses_1.DailyWordResponses.SUCCESSFULLY_CREATED, createDailyWordData);
});
const createManyWordsForTheDayService = utilities_1.errorUtilities.withServiceErrorHandling(async (wordDataArray, languageId) => {
    const BATCH_SIZE = 200;
    const created = [];
    const uncreated = [];
    const incomplete = [];
    if (!wordDataArray || !Array.isArray(wordDataArray) || wordDataArray.length === 0) {
        throw utilities_1.errorUtilities.createError(responses_1.DailyWordResponses.PHRASES_ARRAY_NEEDED, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    for (let i = 0; i < wordDataArray.length; i += BATCH_SIZE) {
        const batch = wordDataArray.slice(i, i + BATCH_SIZE);
        for (const wordData of batch) {
            const { recordings, yorubaText, englishText, pronunciationNote } = wordData;
            if (!recordings || !yorubaText || !englishText) {
                incomplete.push(wordData);
                continue;
            }
            try {
                const languageCheck = await language_repository_1.default.getLanguage(languageId);
                if (!languageCheck) {
                    uncreated.push({ ...wordData, reason: responses_1.LanguageResponses.NOT_FOUND });
                    continue;
                }
                const existingWord = await wordForTheDay_repository_1.default.getOne({ languageText: yorubaText, englishText });
                if (existingWord) {
                    uncreated.push({ ...wordData, reason: responses_1.DailyWordResponses.ALREADY_EXISTS });
                    continue;
                }
                const createDailyWordData = {
                    id: (0, uuid_1.v4)(),
                    languageId,
                    dateUsed: null,
                    audioUrls: recordings,
                    languageText: yorubaText,
                    englishText,
                    pronunciationNote,
                    isActive: true,
                    isUsed: false,
                };
                const createdWord = await wordForTheDay_repository_1.default.create(createDailyWordData);
                if (createdWord) {
                    created.push(createDailyWordData);
                }
                else {
                    uncreated.push({ ...wordData, reason: responses_1.DailyWordResponses.UNABLE_TO_CREATE });
                }
            }
            catch (error) {
                uncreated.push({ ...wordData, reason: error.message || responses_1.DailyWordResponses.UNABLE_TO_CREATE });
            }
        }
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.MultiStatus, responses_1.DailyWordResponses.BULK_CREATION_DONE, {
        totalReceived: wordDataArray.length,
        createdCount: created.length,
        uncreatedCount: uncreated.length,
        incompleteCount: incomplete.length,
        created,
        uncreated,
        incomplete,
    });
});
const getTodayWordService = utilities_1.errorUtilities.withServiceErrorHandling(async (languageId, userId) => {
    let today;
    if (userId) {
        const userDetails = await (0, axiosCalls_1.fetchSingleUser)(userId, ["id", "email", "timeZone"]);
        const user = userDetails.data;
        const userTimezone = user.timeZone || 'UTC';
        const now = new Date();
        today = new Intl.DateTimeFormat('en-CA', {
            timeZone: userTimezone
        }).format(now);
    }
    else {
        today = (0, dayjs_1.default)().utc().startOf('day').toDate();
    }
    const filter = {
        languageId,
        dateUsed: today,
    };
    let todayWord = await wordForTheDay_repository_1.default.getOne(filter);
    if (!todayWord) {
        console.log("Word for today not found. Attempting to assign a word...");
        const unusedWordFilter = {
            languageId,
            dateUsed: null
        };
        let availableWord = await wordForTheDay_repository_1.default.getOneOldWord(unusedWordFilter);
        if (!availableWord) {
            console.log("No unused words found. Checking for words older than 30 days...");
            const thirtyDaysAgo = (0, dayjs_1.default)().utc().subtract(30, 'days').startOf('day').toDate();
            const oldWordFilter = {
                languageId,
                dateUsed: {
                    [sequelize_1.Op.lt]: thirtyDaysAgo
                }
            };
            availableWord = await wordForTheDay_repository_1.default.getOneOldWord(oldWordFilter);
        }
        if (!availableWord) {
            console.error("No available words found to assign for today.");
            throw utilities_1.errorUtilities.createError(responses_1.DailyWordResponses.NO_AVAILABLE_WORDS, statusCodes_responses_1.StatusCodes.NotFound);
        }
        const updateData = {
            dateUsed: today
        };
        todayWord = await wordForTheDay_repository_1.default.updateOne({ id: availableWord.id }, updateData);
        console.log(`Successfully assigned word for today.`);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.DailyWordResponses.TODAY_WORD_FOUND, todayWord);
});
exports.default = {
    createWordForTheDayService,
    createManyWordsForTheDayService,
    getTodayWordService
};
