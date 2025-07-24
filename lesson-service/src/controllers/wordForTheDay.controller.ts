import { DailyWordResponses } from "../responses/responses";
import { responseUtilities, errorUtilities } from "../../../shared/utilities";
import { Request, Response } from "express";
import { StatusCodes } from "../../../shared/statusCodes/statusCodes.responses";
import { LanguageCode } from "../data-types/enums";
import { fetchEdedunLanguage } from "../utilities/axiosCalls";
import { dailyWordsServices } from "../services";
import { v4 } from "uuid";


const createDailyWordController = errorUtilities.withControllerErrorHandling(async (request: Request, response: Response) => {
    const { languageCode, englishText, languageText } = request.body;
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

        const phraseData  = {
            languageId: v4(),
            //request.params.id,
            audioUrls: data.recordings,
            languageText:data.yorubaText,
            englishText
        }

        const createdWord = await dailyWordsServices.createWordForTheDayService(phraseData)

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
    getWordOfTheDayController
}
