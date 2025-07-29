"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../utilities");
const phrasesRepository_1 = __importDefault(require("../repositories/phrasesRepository"));
const uuid_1 = require("uuid");
const recordingRepository_1 = __importDefault(require("../repositories/recordingRepository"));
const phrasesRepository_2 = __importDefault(require("../repositories/phrasesRepository"));
const sequelize_1 = require("sequelize");
const addRecording = utilities_1.errorUtilities.withErrorHandling(async (recordingPayload) => {
    let { userId, phraseId, recordingUrl } = recordingPayload;
    const existingPhrase = (await phrasesRepository_1.default.phrasesRepository.getOne({
        id: phraseId,
    }));
    if (!existingPhrase) {
        throw utilities_1.errorUtilities.createError('Phrase may have been deleted, please try again or contact the admin', 400);
    }
    const existingRecording = await recordingRepository_1.default.recordingRepository.getOne({ phrase_id: phraseId, user_id: userId });
    if (existingRecording) {
        throw utilities_1.errorUtilities.createError('You have already made a recording for this phrase, you can delete it and record again.', 400);
    }
    const recordingId = (0, uuid_1.v4)();
    const recordingCreationPayload = {
        id: recordingId,
        user_id: userId,
        phrase_id: phraseId,
        recording_url: recordingUrl,
        status: "Recorded"
    };
    const newRecoerdinng = await recordingRepository_1.default.recordingRepository.create(recordingCreationPayload);
    if (!newRecoerdinng) {
        throw utilities_1.errorUtilities.createError('Unable to save recording, try again please', 400);
    }
    const recording = await recordingRepository_1.default.recordingRepository.getOne({
        id: recordingId,
    });
    return utilities_1.responseUtilities.handleServicesResponse(201, "Recording saved successfully, we appreciate you!!", recording);
});
const getAllMyRecordings = utilities_1.errorUtilities.withErrorHandling(async (userId, page = 1) => {
    const recordedPhrases = await recordingRepository_1.default.recordingRepository.getMany({ user_id: userId });
    if (!recordedPhrases) {
        throw utilities_1.errorUtilities.createError('No recorded phrases found', 400);
    }
    const recordingsWithPhrases = await Promise.all(recordedPhrases.map(async (record) => {
        const phrase = await phrasesRepository_2.default.phrasesRepository.getOne({ id: record.phrase_id });
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
    return utilities_1.responseUtilities.handleServicesResponse(200, 'Phrases and recordings fetched successfully', {
        // currentPage: page,
        // totalPages,
        // totalItems,
        data: recordingsWithPhrases
    });
});
const getAllMyUnrecordedPhrases = utilities_1.errorUtilities.withErrorHandling(async (userId, page = 1) => {
    const recordedPhrases = await recordingRepository_1.default.recordingRepository.getMany({ user_id: userId });
    const recordedPhraseIds = recordedPhrases.map(record => record.phrase_id);
    let unrecordedPhrases;
    if (recordedPhraseIds && recordedPhraseIds.length) {
        unrecordedPhrases = await phrasesRepository_2.default.phrasesRepository.getMany({
            id: {
                [sequelize_1.Op.notIn]: recordedPhraseIds
            }
        });
    }
    else {
        unrecordedPhrases = await phrasesRepository_2.default.phrasesRepository.getMany({});
    }
    if (!unrecordedPhrases) {
        throw utilities_1.errorUtilities.createError('No unrecorded phrases found', 400);
    }
    const responseData = unrecordedPhrases.map((phrase) => ({
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
    return utilities_1.responseUtilities.handleServicesResponse(200, 'Unrecorded phrases fetched successfully', {
        currentPage: page,
        totalPages,
        totalItems,
        data: paginatedData
    });
});
const deleteMyRecordings = utilities_1.errorUtilities.withErrorHandling(async (recordingId) => {
    const deleteRecording = await recordingRepository_1.default.recordingRepository.deleteOne({ id: recordingId });
    if (!deleteRecording) {
        throw utilities_1.errorUtilities.createError('Unable to delete recording, please contact admin', 400);
    }
    return utilities_1.responseUtilities.handleServicesResponse(200, 'Recording deleted successfully');
});
exports.default = {
    addRecording,
    deleteMyRecordings,
    getAllMyRecordings,
    getAllMyUnrecordedPhrases
};
