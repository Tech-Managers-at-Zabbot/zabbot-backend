import { errorUtilities, responseUtilities } from "../utilities";
import phraseRepository from "../repositories/phrasesRepository";
import { PhraseAttributes } from "../types/modelTypes";
import { CloudinaryResponse, CloudinaryResource } from "../types/generalTypes";
import { v4 } from 'uuid';
import { cloudinary } from '../utilities/cloudinary';
import Recordings from "../models/recordings/recordingModel";
import recordingRepository from "../repositories/recordingRepository";

const addPhrase = errorUtilities.withErrorHandling(
    async (phrasePayload: Record<string, any>): Promise<Record<string, any>> => {

        let { yoruba_text, english_text, pronounciation_note, phrase_category } = phrasePayload;

        const existingEnglishPhrase = (await phraseRepository.phrasesRepository.getOne({
            english_text,
        })) as unknown as PhraseAttributes;

        const existingYorubaPhrase = (await phraseRepository.phrasesRepository.getOne({
            yoruba_text,
        })) as unknown as PhraseAttributes;

        if (existingEnglishPhrase) {
            throw errorUtilities.createError(
                'English phrase already exists',
                400
            );
        }

        if (existingYorubaPhrase) {
            throw errorUtilities.createError(
                'Yoruba phrase already exists',
                400
            );
        }

        const phraseId = v4();

        const phraseCreationPayload = {
            id: phraseId,
            english_text,
            pronounciation_note,
            phrase_category,
            yoruba_text,
        };

        const newPhrase = await phraseRepository.phrasesRepository.create(
            phraseCreationPayload
        );

        if (!newPhrase) {
            throw errorUtilities.createError(
                'Unable to create phrase',
                400
            );
        }

        const phrase: any = await phraseRepository.phrasesRepository.getOne({
            id: phraseId,
        });

        return responseUtilities.handleServicesResponse(201, "Phrase added successfully", phrase);
    }
);

const updatePhrase = errorUtilities.withErrorHandling(
    async (profilePayload: Record<string, any>): Promise<Record<string, any>> => {
        const { body } = profilePayload;

        const { phraseId } = profilePayload;

        const phrase: any = await phraseRepository.phrasesRepository.getOne({ id: phraseId });


        if (!phrase) {
            throw errorUtilities.createError(
                'Phrase not found, please try again',
                400
            );
        }

        if (
            (!body.english_text || body.english_text === "") &&
            (!body.yoruba_text || body.yoruba_text === "")
        ) {
            throw errorUtilities.createError(
                'Please select at least a field to update',
                400
            );
        }

        let updateDetails: Record<string, any> = {};

        if (body.english_text) {
            updateDetails.english_text = body.english_text.trim();
        }

        if (body.yoruba_text) {
            updateDetails.yoruba_text = body.yoruba_text.trim();
        }

        const updatedPhrase = await phraseRepository.phrasesRepository.updateOne(
            { id: phraseId },
            updateDetails
        );

        return responseUtilities.handleServicesResponse(
            200,
            'phrase updated successfully',
            updatedPhrase
        );
    }
);

const deletePhrase = errorUtilities.withErrorHandling(
    async (phraseId: string): Promise<Record<string, any>> => {

        const phrase: any = await phraseRepository.phrasesRepository.getOne({ id: phraseId });

        if (!phrase) {
            throw errorUtilities.createError(
                'Phrase not found, please try again',
                400
            );
        }

        const deletedPhrase = await phraseRepository.phrasesRepository.deleteOne(
            { phraseId }
        );

        if (!deletedPhrase) {
            throw errorUtilities.createError(
                'Phrase not deleted, please try again',
                400
            );
        }

        return responseUtilities.handleServicesResponse(
            200,
            'phrase deleted successfully',
        );
    }
)

const addManyPhrases = errorUtilities.withErrorHandling(
    async (phraseArray: Record<string, any>[]): Promise<Record<string, any>> => {
        const createdPhrases:Record<string, any>[] = [];

        for (const phrasePayload of phraseArray) {
            let { yoruba_text, english_text, pronounciation_note, phrase_category } = phrasePayload;

            const existingEnglishPhrase = await phraseRepository.phrasesRepository.getOne({ english_text });
            const existingYorubaPhrase = await phraseRepository.phrasesRepository.getOne({ yoruba_text });

            if (existingEnglishPhrase || existingYorubaPhrase) {
                continue;
            }

            const phraseId = v4();
            const phraseCreationPayload = { id: phraseId, yoruba_text, english_text, pronounciation_note, phrase_category };
            const newPhrase:Record<string, any> = await phraseRepository.phrasesRepository.create(phraseCreationPayload);

            if (newPhrase) {
                createdPhrases.push(newPhrase);
            }
        }

        if (createdPhrases.length === 0) {
            throw errorUtilities.createError('No new phrases were created because all the phrases already exist', 400);
        }

        return responseUtilities.handleServicesResponse(
            201,
            'Phrases added successfully',
            createdPhrases
        );
    }
);

const getAllClouinaryRecordingsService = errorUtilities.withErrorHandling(
    async (folderPath: string): Promise<Record<string, any>> => {
        let allResources: CloudinaryResource[] = [];
        let nextCursor: string | undefined;

        do {
            // Get a batch of resources (max 500 per request)
            const options: any = {
                type: 'upload',
                prefix: folderPath,
                resource_type: 'raw',
                max_results: 200
            };

            if (nextCursor) {
                options.next_cursor = nextCursor;
            }

            const result = await cloudinary.api.resources(options) as CloudinaryResponse;

            // Add this batch to our collected resources
            allResources = [...allResources, ...result.resources];

            // Set cursor for next iteration (if any)
            nextCursor = result.next_cursor;

        } while (nextCursor);

        return allResources;

    })

const findOrphanedFilesService = errorUtilities.withErrorHandling(
    async (cloudinaryFiles: CloudinaryResource[],
        databaseFiles: string[]): Promise<CloudinaryResource[]> => {

        console.log('cloudinaryFiles length:', cloudinaryFiles.length);
        console.log('databaseFiles length:', databaseFiles.length);

        return cloudinaryFiles.filter(cloudFile => {
            // For each Cloudinary file, check if it exists in the database

            // If you store public_ids directly in the DB
            if (databaseFiles.includes(cloudFile.public_id)) {
                return false; // Not orphaned, keep it
            }

            // If you store full URLs in the DB
            if (databaseFiles.includes(cloudFile.url) || databaseFiles.includes(cloudFile.secure_url)) {
                return false; // Not orphaned, keep it
            }

            // If the URL might be stored differently, check for partial matches
            const isReferenced = databaseFiles.some(dbUrl => {
                return dbUrl.includes(cloudFile.public_id);
            });

            // If not found in the database, it's orphaned
            return !isReferenced; // Return true if it's orphaned
        });
    }
);

const getAllDatabaseAudioFilesService = errorUtilities.withErrorHandling(
    async (): Promise<Record<string, any>> => {

        // Using Sequelize syntax for PostgreSQL
        const audioRecords = await Recordings.findAll({
            attributes: ['recording_url']
        });

        return audioRecords.map(record => {
            const plainRecord: any = record instanceof Recordings ? record.get({ plain: true }) : record;
            const url = plainRecord.recording_url;

            // Extract the full path after the version number
            // This pattern specifically targets your URL format
            const matches = url.match(/\/v\d+\/(.+?)$/);
            if (matches && matches[1]) {
                return matches[1]; // This will be "Ededun/Audio/idlenh9jgx2bli2aiefl.wav"
            }

            return url;
        });

    })

const deleteOrphanedFilesService = errorUtilities.withErrorHandling(
    async (orphanedFiles: CloudinaryResource[]): Promise<Record<string, any>> => {
        console.log('eddy', orphanedFiles)
        const deletionPromises = orphanedFiles.map(file => {
            return cloudinary.uploader.destroy(file.public_id, { resource_type: 'raw' })
                .then(result => ({
                    public_id: file.public_id,
                    result: result.result,
                    timestamp: new Date().toISOString()
                }))
                .catch(error => ({
                    public_id: file.public_id,
                    result: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                }));
        });

        return Promise.all(deletionPromises);
    }
)


const getPhraseWithAllRecordingsForZabbot = errorUtilities.withErrorHandling(
    async (englishText: string, yorubaText: string): Promise<any> => {

        if (!englishText && !yorubaText) {
            throw errorUtilities.createError("Either English Text or Yoruba Text must be provided", 400);
        }

        const filter: Record<string, any> = {};

        if (yorubaText) {

            filter.yoruba_text = yorubaText;

        } else if (englishText) {

            filter.english_text = englishText;

        }

        const checkPhrase: Partial<PhraseAttributes> | any = await phraseRepository.phrasesRepository.getOne(
            filter,
            ["id", "yoruba_text", "english_text", "pronounciation_note"]
        );

        if (!checkPhrase) {
            throw errorUtilities.createError("This phrase does not have a recording in our database", 404);
        }

        const findRecordings = await recordingRepository.recordingRepository.getMany({ phrase_id: checkPhrase.id })

        const recordingsUrl = findRecordings
            .filter((recording: any) => recording.recording_url)
            .map((recording: any) => recording.recording_url);

        const fullrecodingDetails = {
            recordings: recordingsUrl,
            englishText: checkPhrase.english_text,
            yorubaText: checkPhrase.yoruba_text,
            pronunciationNote: checkPhrase.pronounciation_note
        }

        return responseUtilities.handleServicesResponse(
            201,
            'Recordings fetched successfully',
            fullrecodingDetails
        );
    }
);


const getPhrasesWithAllRecordingsForZabbotParallel = errorUtilities.withErrorHandling(
    async (phrases: Array<{englishText?: string, yorubaText?: string}>): Promise<any> => {

        if (!phrases || !Array.isArray(phrases) || phrases.length === 0) {
            throw errorUtilities.createError("Phrases array must be provided and cannot be empty", 400);
        }

        const processPhrasePromises = phrases.map(async (phrase) => {
            const { englishText, yorubaText } = phrase;

            if (!englishText && !yorubaText) {
                return {
                    error: "Either English Text or Yoruba Text must be provided",
                    englishText: englishText || null,
                    yorubaText: yorubaText || null,
                    recordings: []
                };
            }

            try {
                const filter: Record<string, any> = {};

                if (yorubaText) {
                    filter.yoruba_text = yorubaText;
                } else if (englishText) {
                    filter.english_text = englishText;
                }

                const checkPhrase: Partial<PhraseAttributes> | any = await phraseRepository.phrasesRepository.getOne(
                    filter,
                    ["id", "yoruba_text", "english_text", "pronounciation_note"]
                );

                if (!checkPhrase) {
                    return {
                        error: "This phrase does not have a recording in our database",
                        englishText: englishText || null,
                        yorubaText: yorubaText || null,
                        recordings: []
                    };
                }

                const findRecordings = await recordingRepository.recordingRepository.getMany({ 
                    phrase_id: checkPhrase.id 
                });

                const recordingsUrl = findRecordings
                    .filter((recording: any) => recording.recording_url)
                    .map((recording: any) => recording.recording_url);

                return {
                    recordings: recordingsUrl,
                    englishText: checkPhrase.english_text,
                    yorubaText: checkPhrase.yoruba_text,
                    pronunciationNote: checkPhrase.pronounciation_note
                };

            } catch (error: any) {
                return {
                    error: error.message || "An error occurred while processing this phrase",
                    englishText: englishText || null,
                    yorubaText: yorubaText || null,
                    recordings: []
                };
            }
        });

        const results = await Promise.all(processPhrasePromises);

        console.log('Batch Results', results);

        return responseUtilities.handleServicesResponse(
            200,
            'Batch recordings fetched successfully',
            results
        );
    }
);


export default {
    addPhrase,
    updatePhrase,
    deletePhrase,
    addManyPhrases,
    getAllClouinaryRecordingsService,
    findOrphanedFilesService,
    getAllDatabaseAudioFilesService,
    deleteOrphanedFilesService,
    getPhraseWithAllRecordingsForZabbot,
    getPhrasesWithAllRecordingsForZabbotParallel
}