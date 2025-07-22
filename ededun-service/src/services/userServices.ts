import { errorUtilities, responseUtilities } from "../utilities";
import phraseRepository from "../repositories/phrasesRepository";
import { PhraseAttributes, RecordingAttributes } from "../types/modelTypes";
import { v4 } from 'uuid';
import recordingRepository from "../repositories/recordingRepository";
import phrasesRepository from "../repositories/phrasesRepository";
import { Op } from 'sequelize';



const addRecording = errorUtilities.withErrorHandling(
    async (recordingPayload: Record<string, any>): Promise<Record<string, any>> => {

        let { userId, phraseId, recordingUrl } = recordingPayload;


        const existingPhrase = (await phraseRepository.phrasesRepository.getOne({
            id: phraseId,
        })) as unknown as PhraseAttributes;

        if (!existingPhrase) {
            throw errorUtilities.createError(
                'Phrase may have been deleted, please try again or contact the admin',
                400
            );
        }

        const existingRecording = await recordingRepository.recordingRepository.getOne({ phrase_id: phraseId, user_id: userId });

        if (existingRecording) {
            throw errorUtilities.createError(
                'You have already made a recording for this phrase, you can delete it and record again.',
                400
            );
        }

        const recordingId = v4();

        const recordingCreationPayload = {
            id: recordingId,
            user_id: userId,
            phrase_id: phraseId,
            recording_url: recordingUrl,
            status: "Recorded"
        };

        const newRecoerdinng = await recordingRepository.recordingRepository.create(
            recordingCreationPayload
        );

        if (!newRecoerdinng) {
            throw errorUtilities.createError(
                'Unable to save recording, try again please',
                400
            );
        }

        const recording: any = await recordingRepository.recordingRepository.getOne({
            id: recordingId,
        });

        return responseUtilities.handleServicesResponse(201, "Recording saved successfully, we appreciate you!!", recording);
    }
);

const getAllMyRecordings = errorUtilities.withErrorHandling(
    async (userId: string, page: number = 1): Promise<Record<string, any>> => {
        const recordedPhrases: any[] = await recordingRepository.recordingRepository.getMany({ user_id: userId });

        if (!recordedPhrases) {
            throw errorUtilities.createError(
                'No recorded phrases found',
                400
            );
        }

        const recordingsWithPhrases = await Promise.all(recordedPhrases.map(async (record) => {
            const phrase: any = await phrasesRepository.phrasesRepository.getOne({ id: record.phrase_id });
            return {
                id: record.id,
                user_id: record.user_id,
                recording_url: record.recording_url,
                status: record.status,
                phrase: phrase ? {
                    id: phrase.id,
                    english_text: phrase.english_text,
                    yoruba_text: phrase.yoruba_text,
                    pronounciation_note: phrase.pronounciation_note,
                    phrase_category: phrase.phrase_category
                } : null
            };
        }));

        // const itemsPerPage = 10;
        // const totalItems = recordingsWithPhrases.length;
        // const totalPages = Math.ceil(totalItems / itemsPerPage);
        // const paginatedData = recordingsWithPhrases.slice((page - 1) * itemsPerPage, page * itemsPerPage);

        return responseUtilities.handleServicesResponse(
            200,
            'Phrases and recordings fetched successfully',
            {
                // currentPage: page,
                // totalPages,
                // totalItems,
                data: recordingsWithPhrases
            }
        );
    }
);

const getAllMyUnrecordedPhrases = errorUtilities.withErrorHandling(
    async (userId: string, page: number = 1): Promise<Record<string, any>> => {

        const recordedPhrases: any[] = await recordingRepository.recordingRepository.getMany({ user_id: userId });

        const recordedPhraseIds = recordedPhrases.map(record => record.phrase_id);

        let unrecordedPhrases;

        if (recordedPhraseIds && recordedPhraseIds.length) {
            unrecordedPhrases = await phrasesRepository.phrasesRepository.getMany(

                {
                    id: {
                        [Op.notIn]: recordedPhraseIds
                    }
                }
            );

        } else {
            unrecordedPhrases = await phrasesRepository.phrasesRepository.getMany({});
        }

        if (!unrecordedPhrases) {
            throw errorUtilities.createError(
                'No unrecorded phrases found',
                400
            );
        }

        const responseData = unrecordedPhrases.map((phrase: Record<string, any>) => ({
            id: phrase.id,
            english_text: phrase.english_text,
            yoruba_text: phrase.yoruba_text,
            pronounciation_note: phrase.pronounciation_note,
            phrase_category: phrase.phrase_category
        }));

        const itemsPerPage = 10;
        const totalItems = responseData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const paginatedData = responseData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

        return responseUtilities.handleServicesResponse(
            200,
            'Unrecorded phrases fetched successfully',
            {
                currentPage: page,
                totalPages,
                totalItems,
                data: paginatedData
            }
        );
    }
);

const deleteMyRecordings = errorUtilities.withErrorHandling(
    async (recordingId: string): Promise<Record<string, any>> => {

        const deleteRecording = await recordingRepository.recordingRepository.deleteOne({ id: recordingId })


        if (!deleteRecording) {
            throw errorUtilities.createError(
                'Unable to delete recording, please contact admin',
                400
            );
        }

        return responseUtilities.handleServicesResponse(
            200,
            'Recording deleted successfully'
        );

    })



export default {
    addRecording,
    deleteMyRecordings,
    getAllMyRecordings,
    getAllMyUnrecordedPhrases
}