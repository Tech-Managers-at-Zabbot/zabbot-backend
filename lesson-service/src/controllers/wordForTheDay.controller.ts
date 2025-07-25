import { DailyWordResponses, LanguageResponses } from "../responses/responses";
import { responseUtilities, errorUtilities } from "../../../shared/utilities";
import { Request, Response } from "express";
import { StatusCodes } from "../../../shared/statusCodes/statusCodes.responses";
import { LanguageCode } from "../data-types/enums";
import { fetchEdedunLanguage, fetchEdedunLanguageBatches } from "../utilities/axiosCalls";
import { dailyWordsServices } from "../services";
import { v4 } from "uuid";
import languageRepositories from "../repositories/language.repository";


const createDailyWordController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
    const { languageCode, englishText, languageText } = request.body;

    const { languageId } = request.params;

    const language = await languageRepositories.getLanguage(languageId)

    if (!language) {
        throw errorUtilities.createError(LanguageResponses.NOT_FOUND, StatusCodes.NotFound);
    }

    if (!languageCode) {
        throw errorUtilities.createError(DailyWordResponses.REQUIRED_LANGUAGE_CODE, StatusCodes.BadRequest);
    }

    if (!languageText && !englishText) {
        throw errorUtilities.createError(DailyWordResponses.REQUIRED_LANGUAGE_DATA, StatusCodes.BadRequest);
    }
    if (languageCode === LanguageCode.YORUBA) {
        const fetchFromEdedun = await fetchEdedunLanguage(englishText, languageText);

        if (!fetchFromEdedun.success) {
            return responseUtilities.responseHandler(
                response,
                fetchFromEdedun.message,
                fetchFromEdedun.statusCode
            );
        }

        const { data } = fetchFromEdedun

        const dailyWordData = {
            languageId,
            audioUrls: data.recordings,
            languageText: data.yorubaText,
            englishText,
            pronunciationNote: data.pronunciationNote
        }

        const createdWord = await dailyWordsServices.createWordForTheDayService(dailyWordData)

        return responseUtilities.responseHandler(
            response,
            createdWord.message,
            createdWord.statusCode,
            createdWord.data
        );

    }
})

const createManyDailyWordsController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
    const { languageCode, wordArr } = request.body;

    const { languageId } = request.params;

    const language = await languageRepositories.getLanguage(languageId)

    if (!wordArr || !Array.isArray(wordArr) || wordArr.length === 0) {
        throw errorUtilities.createError(DailyWordResponses.PHRASES_ARRAY_NEEDED, StatusCodes.BadRequest);
    }

    if (!language) {
        throw errorUtilities.createError(LanguageResponses.NOT_FOUND, StatusCodes.NotFound);
    }

    if (!languageCode) {
        throw errorUtilities.createError(DailyWordResponses.REQUIRED_LANGUAGE_CODE, StatusCodes.BadRequest);
    }

    if (languageCode === LanguageCode.YORUBA) {
        const fetchFromEdedun = await fetchEdedunLanguageBatches(wordArr);

        if (!fetchFromEdedun.success) {
            return responseUtilities.responseHandler(
                response,
                fetchFromEdedun.message,
                fetchFromEdedun.statusCode
            );
        }

        const { data } = fetchFromEdedun

        const createdWord = await dailyWordsServices.createManyWordsForTheDayService(data, languageId)

        return responseUtilities.responseHandler(
            response,
            createdWord.message,
            createdWord.statusCode,
            createdWord.data
        );

    }

})

const getWordOfTheDayController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
    const { languageId } = request.params

    const getWord = await dailyWordsServices.getTodayWordService(languageId)

    return responseUtilities.responseHandler(
        response,
        getWord.message,
        getWord.statusCode,
        getWord.data
    );
})


export default {
    createDailyWordController,
    getWordOfTheDayController,
    createManyDailyWordsController
}
