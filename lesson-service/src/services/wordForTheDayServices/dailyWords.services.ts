import wordForTheDayRepositories from "../../repositories/wordForTheDay.repository";
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import { v4 } from 'uuid';
import languageRepositories from "../../repositories/language.repository";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { DailyWordResponses, LanguageResponses } from "../../responses/responses";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Op } from "sequelize";


dayjs.extend(utc);


const createWordForTheDayService = errorUtilities.withServiceErrorHandling(
    async (wordData: Record<string, any>) => {

        const { languageId, audioUrls, languageText, englishText, pronunciationNote } = wordData

        // const languageCheck = await languageRepositories.getLanguage(languageId)

        // if (!languageCheck) {
        //     throw errorUtilities.createError(
        //         LanguageResponses.NOT_FOUND,
        //         StatusCodes.NotFound
        //     );
        // }

        const existingWord = await wordForTheDayRepositories.getOne({ languageText, englishText });

        if (existingWord) {
            throw errorUtilities.createError(
                DailyWordResponses.ALREADY_EXISTS,
                StatusCodes.BadRequest
            );
        }

        const createDailyWordData = {
            id: v4(),
            languageId,
            dateUsed: null,
            audioUrls,
            languageText,
            englishText,
            pronunciationNote,
            isActive: true,
            isUsed: false
        }

        const createdWord = await wordForTheDayRepositories.create(createDailyWordData)

        if (!createdWord) {
            throw errorUtilities.createError(
                DailyWordResponses.UNABLE_TO_CREATE,
                StatusCodes.NotImplemented
            );
        }

        return responseUtilities.handleServicesResponse(
            StatusCodes.Created,
            DailyWordResponses.SUCCESSFULLY_CREATED,
            createDailyWordData
        );
    }
);

const createManyWordsForTheDayService = errorUtilities.withServiceErrorHandling(
    async (wordDataArray: Record<string, any>[], languageId: string) => {
        const BATCH_SIZE = 200;
        const created: any[] = [];
        const uncreated: any[] = [];
        const incomplete: any[] = [];

        if (!wordDataArray || !Array.isArray(wordDataArray) || wordDataArray.length === 0) {
            throw errorUtilities.createError(DailyWordResponses.PHRASES_ARRAY_NEEDED, StatusCodes.BadRequest);
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
                    const languageCheck = await languageRepositories.getLanguage(languageId);
                    if (!languageCheck) {
                        uncreated.push({ ...wordData, reason: LanguageResponses.NOT_FOUND });
                        continue;
                    }

                    const existingWord = await wordForTheDayRepositories.getOne({ languageText: yorubaText, englishText });
                    if (existingWord) {
                        uncreated.push({ ...wordData, reason: DailyWordResponses.ALREADY_EXISTS });
                        continue;
                    }

                    const createDailyWordData = {
                        id: v4(),
                        languageId,
                        dateUsed: null,
                        audioUrls: recordings,
                        languageText: yorubaText,
                        englishText,
                        pronunciationNote,
                        isActive: true,
                        isUsed: false,
                    };

                    const createdWord = await wordForTheDayRepositories.create(createDailyWordData);
                    if (createdWord) {
                        created.push(createDailyWordData);
                    } else {
                        uncreated.push({ ...wordData, reason: DailyWordResponses.UNABLE_TO_CREATE });
                    }
                } catch (error: any) {
                    uncreated.push({ ...wordData, reason: error.message || DailyWordResponses.UNABLE_TO_CREATE });
                }
            }
        }

        return responseUtilities.handleServicesResponse(
            StatusCodes.MultiStatus,
            DailyWordResponses.BULK_CREATION_DONE,
            {
                totalReceived: wordDataArray.length,
                createdCount: created.length,
                uncreatedCount: uncreated.length,
                incompleteCount: incomplete.length,
                created,
                uncreated,
                incomplete,
            }
        );
    }
);

const getTodayWordService = errorUtilities.withServiceErrorHandling(
    async (languageId: string) => {
        const today = dayjs().utc().startOf('day').toDate();

        const filter = {
            languageId,
            dateUsed: today,
        }

        let todayWord = await wordForTheDayRepositories.getOne(filter);

        if (!todayWord) {
            console.log("Word for today not found. Attempting to assign a word...");

            const unusedWordFilter = {
                languageId,
                dateUsed: null
            };

            let availableWord = await wordForTheDayRepositories.getOneOldWord(unusedWordFilter);

            if (!availableWord) {
                console.log("No unused words found. Checking for words older than 30 days...");

                const thirtyDaysAgo = dayjs().utc().subtract(30, 'days').startOf('day').toDate();

                const oldWordFilter = {
                    languageId,
                    dateUsed: {
                        [Op.lt]: thirtyDaysAgo
                    }
                };

                availableWord = await wordForTheDayRepositories.getOneOldWord(oldWordFilter);
            }

            if (!availableWord) {
                console.error("No available words found to assign for today.");
                throw errorUtilities.createError(
                    DailyWordResponses.NO_AVAILABLE_WORDS,
                    StatusCodes.NotFound
                );
            }

            const updateData = {
                dateUsed: today
            };

            todayWord = await wordForTheDayRepositories.updateOne(
                { id: availableWord.id },
                updateData
            );

            console.log(`Successfully assigned word ID ${availableWord.id} for today.`);
        }

        return responseUtilities.handleServicesResponse(
            StatusCodes.OK,
            DailyWordResponses.TODAY_WORD_FOUND,
            todayWord
        );
    }
);

export default {
    createWordForTheDayService,
    createManyWordsForTheDayService,
    getTodayWordService
}
