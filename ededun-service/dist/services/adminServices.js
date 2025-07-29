"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../utilities");
const phrasesRepository_1 = __importDefault(require("../repositories/phrasesRepository"));
const uuid_1 = require("uuid");
const cloudinary_1 = require("../utilities/cloudinary");
const recordingModel_1 = __importDefault(require("../models/recordings/recordingModel"));
const recordingRepository_1 = __importDefault(require("../repositories/recordingRepository"));
const addPhrase = utilities_1.errorUtilities.withErrorHandling(async (phrasePayload) => {
    let { yoruba_text, english_text, pronounciation_note, phrase_category } = phrasePayload;
    const existingEnglishPhrase = (await phrasesRepository_1.default.phrasesRepository.getOne({
        english_text,
    }));
    const existingYorubaPhrase = (await phrasesRepository_1.default.phrasesRepository.getOne({
        yoruba_text,
    }));
    if (existingEnglishPhrase) {
        throw utilities_1.errorUtilities.createError('English phrase already exists', 400);
    }
    if (existingYorubaPhrase) {
        throw utilities_1.errorUtilities.createError('Yoruba phrase already exists', 400);
    }
    const phraseId = (0, uuid_1.v4)();
    const phraseCreationPayload = {
        id: phraseId,
        english_text,
        pronounciation_note,
        phrase_category,
        yoruba_text,
    };
    const newPhrase = await phrasesRepository_1.default.phrasesRepository.create(phraseCreationPayload);
    if (!newPhrase) {
        throw utilities_1.errorUtilities.createError('Unable to create phrase', 400);
    }
    const phrase = await phrasesRepository_1.default.phrasesRepository.getOne({
        id: phraseId,
    });
    return utilities_1.responseUtilities.handleServicesResponse(201, "Phrase added successfully", phrase);
});
const updatePhrase = utilities_1.errorUtilities.withErrorHandling(async (profilePayload) => {
    const { body } = profilePayload;
    const { phraseId } = profilePayload;
    const phrase = await phrasesRepository_1.default.phrasesRepository.getOne({ id: phraseId });
    if (!phrase) {
        throw utilities_1.errorUtilities.createError('Phrase not found, please try again', 400);
    }
    if ((!body.english_text || body.english_text === "") &&
        (!body.yoruba_text || body.yoruba_text === "")) {
        throw utilities_1.errorUtilities.createError('Please select at least a field to update', 400);
    }
    let updateDetails = {};
    if (body.english_text) {
        updateDetails.english_text = body.english_text.trim();
    }
    if (body.yoruba_text) {
        updateDetails.yoruba_text = body.yoruba_text.trim();
    }
    const updatedPhrase = await phrasesRepository_1.default.phrasesRepository.updateOne({ id: phraseId }, updateDetails);
    return utilities_1.responseUtilities.handleServicesResponse(200, 'phrase updated successfully', updatedPhrase);
});
const deletePhrase = utilities_1.errorUtilities.withErrorHandling(async (phraseId) => {
    const phrase = await phrasesRepository_1.default.phrasesRepository.getOne({ id: phraseId });
    if (!phrase) {
        throw utilities_1.errorUtilities.createError('Phrase not found, please try again', 400);
    }
    const deletedPhrase = await phrasesRepository_1.default.phrasesRepository.deleteOne({ phraseId });
    if (!deletedPhrase) {
        throw utilities_1.errorUtilities.createError('Phrase not deleted, please try again', 400);
    }
    return utilities_1.responseUtilities.handleServicesResponse(200, 'phrase deleted successfully');
});
const addManyPhrases = utilities_1.errorUtilities.withErrorHandling(async (phraseArray) => {
    const createdPhrases = [];
    for (const phrasePayload of phraseArray) {
        let { yoruba_text, english_text, pronounciation_note, phrase_category } = phrasePayload;
        const existingEnglishPhrase = await phrasesRepository_1.default.phrasesRepository.getOne({ english_text });
        const existingYorubaPhrase = await phrasesRepository_1.default.phrasesRepository.getOne({ yoruba_text });
        if (existingEnglishPhrase || existingYorubaPhrase) {
            continue;
        }
        const phraseId = (0, uuid_1.v4)();
        const phraseCreationPayload = { id: phraseId, yoruba_text, english_text, pronounciation_note, phrase_category };
        const newPhrase = await phrasesRepository_1.default.phrasesRepository.create(phraseCreationPayload);
        if (newPhrase) {
            createdPhrases.push(newPhrase);
        }
    }
    if (createdPhrases.length === 0) {
        throw utilities_1.errorUtilities.createError('No new phrases were created because all the phrases already exist', 400);
    }
    return utilities_1.responseUtilities.handleServicesResponse(201, 'Phrases added successfully', createdPhrases);
});
const getAllClouinaryRecordingsService = utilities_1.errorUtilities.withErrorHandling(async (folderPath) => {
    let allResources = [];
    let nextCursor;
    do {
        // Get a batch of resources (max 500 per request)
        const options = {
            type: 'upload',
            prefix: folderPath,
            resource_type: 'raw',
            max_results: 200
        };
        if (nextCursor) {
            options.next_cursor = nextCursor;
        }
        const result = await cloudinary_1.cloudinary.api.resources(options);
        // Add this batch to our collected resources
        allResources = [...allResources, ...result.resources];
        // Set cursor for next iteration (if any)
        nextCursor = result.next_cursor;
    } while (nextCursor);
    return allResources;
});
const findOrphanedFilesService = utilities_1.errorUtilities.withErrorHandling(async (cloudinaryFiles, databaseFiles) => {
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
});
const getAllDatabaseAudioFilesService = utilities_1.errorUtilities.withErrorHandling(async () => {
    // Using Sequelize syntax for PostgreSQL
    const audioRecords = await recordingModel_1.default.findAll({
        attributes: ['recording_url']
    });
    return audioRecords.map(record => {
        const plainRecord = record instanceof recordingModel_1.default ? record.get({ plain: true }) : record;
        const url = plainRecord.recording_url;
        // Extract the full path after the version number
        // This pattern specifically targets your URL format
        const matches = url.match(/\/v\d+\/(.+?)$/);
        if (matches && matches[1]) {
            return matches[1]; // This will be "Ededun/Audio/idlenh9jgx2bli2aiefl.wav"
        }
        return url;
    });
});
const deleteOrphanedFilesService = utilities_1.errorUtilities.withErrorHandling(async (orphanedFiles) => {
    console.log('eddy', orphanedFiles);
    const deletionPromises = orphanedFiles.map(file => {
        return cloudinary_1.cloudinary.uploader.destroy(file.public_id, { resource_type: 'raw' })
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
});
const getPhraseWithAllRecordingsForZabbot = utilities_1.errorUtilities.withErrorHandling(async (englishText, yorubaText) => {
    if (!englishText && !yorubaText) {
        throw utilities_1.errorUtilities.createError("Either English Text or Yoruba Text must be provided", 400);
    }
    const filter = {};
    if (yorubaText) {
        filter.yoruba_text = yorubaText;
    }
    else if (englishText) {
        filter.english_text = englishText;
    }
    const checkPhrase = await phrasesRepository_1.default.phrasesRepository.getOne(filter, ["id", "yoruba_text", "english_text", "pronounciation_note"]);
    if (!checkPhrase) {
        throw utilities_1.errorUtilities.createError("This phrase does not have a recording in our database", 404);
    }
    const findRecordings = await recordingRepository_1.default.recordingRepository.getMany({ phrase_id: checkPhrase.id });
    const recordingsUrl = findRecordings
        .filter((recording) => recording.recording_url)
        .map((recording) => recording.recording_url);
    const fullrecodingDetails = {
        recordings: recordingsUrl,
        englishText: checkPhrase.english_text,
        yorubaText: checkPhrase.yoruba_text,
        pronunciationNote: checkPhrase.pronounciation_note
    };
    return utilities_1.responseUtilities.handleServicesResponse(201, 'Recordings fetched successfully', fullrecodingDetails);
});
const getPhrasesWithAllRecordingsForZabbotParallel = utilities_1.errorUtilities.withErrorHandling(async (phrases) => {
    if (!phrases || !Array.isArray(phrases) || phrases.length === 0) {
        throw utilities_1.errorUtilities.createError("Phrases array must be provided and cannot be empty", 400);
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
            const filter = {};
            if (yorubaText) {
                filter.yoruba_text = yorubaText;
            }
            else if (englishText) {
                filter.english_text = englishText;
            }
            const checkPhrase = await phrasesRepository_1.default.phrasesRepository.getOne(filter, ["id", "yoruba_text", "english_text", "pronounciation_note"]);
            if (!checkPhrase) {
                return {
                    error: "This phrase does not have a recording in our database",
                    englishText: englishText || null,
                    yorubaText: yorubaText || null,
                    recordings: []
                };
            }
            const findRecordings = await recordingRepository_1.default.recordingRepository.getMany({
                phrase_id: checkPhrase.id
            });
            const recordingsUrl = findRecordings
                .filter((recording) => recording.recording_url)
                .map((recording) => recording.recording_url);
            return {
                recordings: recordingsUrl,
                englishText: checkPhrase.english_text,
                yorubaText: checkPhrase.yoruba_text,
                pronunciationNote: checkPhrase.pronounciation_note
            };
        }
        catch (error) {
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
    return utilities_1.responseUtilities.handleServicesResponse(200, 'Batch recordings fetched successfully', results);
});
exports.default = {
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
};
