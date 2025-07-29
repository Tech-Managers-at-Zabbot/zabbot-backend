"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const responses_1 = require("../responses/responses");
const utilities_1 = require("../../../shared/utilities");
const statusCodes_responses_1 = require("../../../shared/statusCodes/statusCodes.responses");
const enums_1 = require("../data-types/enums");
const axiosCalls_1 = require("../utilities/axiosCalls");
const services_1 = require("../services");
const language_repository_1 = __importDefault(require("../repositories/language.repository"));
const createDailyWordController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { languageCode, englishText, languageText } = request.body;
    const { languageId } = request.params;
    const language = await language_repository_1.default.getLanguage(languageId);
    if (!language) {
        throw utilities_1.errorUtilities.createError(responses_1.LanguageResponses.NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    if (!languageCode) {
        throw utilities_1.errorUtilities.createError(responses_1.DailyWordResponses.REQUIRED_LANGUAGE_CODE, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    if (!languageText && !englishText) {
        throw utilities_1.errorUtilities.createError(responses_1.DailyWordResponses.REQUIRED_LANGUAGE_DATA, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    if (languageCode === enums_1.LanguageCode.YORUBA) {
        const fetchFromEdedun = await (0, axiosCalls_1.fetchEdedunLanguage)(englishText, languageText);
        if (!fetchFromEdedun.success) {
            return utilities_1.responseUtilities.responseHandler(response, fetchFromEdedun.message, fetchFromEdedun.statusCode);
        }
        const { data } = fetchFromEdedun;
        const dailyWordData = {
            languageId,
            audioUrls: data.recordings,
            languageText: data.yorubaText,
            englishText,
            pronunciationNote: data.pronunciationNote
        };
        const createdWord = await services_1.dailyWordsServices.createWordForTheDayService(dailyWordData);
        return utilities_1.responseUtilities.responseHandler(response, createdWord.message, createdWord.statusCode, createdWord.data);
    }
});
const createManyDailyWordsController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { languageCode, wordArr } = request.body;
    const { languageId } = request.params;
    const language = await language_repository_1.default.getLanguage(languageId);
    if (!wordArr || !Array.isArray(wordArr) || wordArr.length === 0) {
        throw utilities_1.errorUtilities.createError(responses_1.DailyWordResponses.PHRASES_ARRAY_NEEDED, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    if (!language) {
        throw utilities_1.errorUtilities.createError(responses_1.LanguageResponses.NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    if (!languageCode) {
        throw utilities_1.errorUtilities.createError(responses_1.DailyWordResponses.REQUIRED_LANGUAGE_CODE, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    if (languageCode === enums_1.LanguageCode.YORUBA) {
        const fetchFromEdedun = await (0, axiosCalls_1.fetchEdedunLanguageBatches)(wordArr);
        if (!fetchFromEdedun.success) {
            return utilities_1.responseUtilities.responseHandler(response, fetchFromEdedun.message, fetchFromEdedun.statusCode);
        }
        const { data } = fetchFromEdedun;
        const createdWord = await services_1.dailyWordsServices.createManyWordsForTheDayService(data, languageId);
        return utilities_1.responseUtilities.responseHandler(response, createdWord.message, createdWord.statusCode, createdWord.data);
    }
});
const getWordOfTheDayController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { languageId } = request.params;
    const { userId } = request.query;
    const getWord = await services_1.dailyWordsServices.getTodayWordService(languageId, userId);
    return utilities_1.responseUtilities.responseHandler(response, getWord.message, getWord.statusCode, getWord.data);
});
exports.default = {
    createDailyWordController,
    getWordOfTheDayController,
    createManyDailyWordsController
};
