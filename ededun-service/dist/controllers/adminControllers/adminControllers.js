"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../../services");
const utilities_1 = require("../../utilities");
const adminCreatePhrase = async (request, response) => {
    const newPhrase = await services_1.adminServices.addPhrase(request.body);
    return utilities_1.responseUtilities.responseHandler(response, newPhrase.message, newPhrase.statusCode, newPhrase.data);
};
const adminCreatesManyPhrases = async (request, response) => {
    const newPhrases = await services_1.adminServices.addManyPhrases(request.body);
    return utilities_1.responseUtilities.responseHandler(response, newPhrases.message, newPhrases.statusCode, newPhrases.data);
};
const adminUpdatesPhrase = async (request, response) => {
    const { body } = request;
    const { phraseId } = request.params;
    const updateData = {
        body, phraseId
    };
    const updatedPhrase = await services_1.adminServices.updatePhrase(updateData);
    return utilities_1.responseUtilities.responseHandler(response, updatedPhrase.message, updatedPhrase.statusCode, updatedPhrase.data);
};
const adminDeletesPhrase = async (request, response) => {
    const { phraseId } = request.params;
    const deletedPhrase = await services_1.adminServices.deletePhrase(phraseId);
    return utilities_1.responseUtilities.responseHandler(response, deletedPhrase.message, deletedPhrase.statusCode, deletedPhrase.data);
};
const adminDeletesCloudinaryLeftOverRecordings = async (request, response) => {
    const cloudinaryFiles = await services_1.adminServices.getAllClouinaryRecordingsService('Ededun/Audio');
    console.log(`Found1 ${cloudinaryFiles.length} files in Cloudinary`);
    const dbAudioFiles = await services_1.adminServices.getAllDatabaseAudioFilesService();
    console.log(`Found2 ${dbAudioFiles.length} audio files in database`);
    console.log('audioFiles', dbAudioFiles);
    const orphanedFiles = await services_1.adminServices.findOrphanedFilesService(cloudinaryFiles, dbAudioFiles);
    console.log(`Found3 ${orphanedFiles} orphaned files to delete`);
    const deletionResults = await services_1.adminServices.deleteOrphanedFilesService(orphanedFiles);
    return utilities_1.responseUtilities.responseHandler(response, 'success', 200, {
        stats: {
            totalCloudinaryFiles: cloudinaryFiles.length,
            totalDatabaseFiles: dbAudioFiles.length,
            orphanedFilesFound: orphanedFiles.length,
            deletedFiles: deletionResults.filter((r) => r.result === 'ok').length,
            failedDeletions: deletionResults.filter((r) => r.result !== 'ok').length
        },
        deletionResults
    });
};
const adminGetsPhraseWithRecordingsForZabbot = async (request, response) => {
    const { englishText, yorubaText } = request.query;
    if (!englishText && !yorubaText) {
        throw utilities_1.errorUtilities.createError("Either English Text or Yoruba Text must be provided", 400);
    }
    const fetchRecordings = await services_1.adminServices.getPhraseWithAllRecordingsForZabbot(englishText, yorubaText);
    return utilities_1.responseUtilities.responseHandler(response, fetchRecordings.message, fetchRecordings.statusCode, fetchRecordings.data);
};
const adminGetsPhraseWithRecordingsForZabbotBatch = async (request, response) => {
    const { phrases } = request.query;
    if (!phrases) {
        throw utilities_1.errorUtilities.createError("Phrases must be provided", 400);
    }
    const phrasesArr = JSON.parse(phrases);
    if (!phrasesArr || !Array.isArray(phrasesArr) || phrasesArr.length === 0) {
        throw utilities_1.errorUtilities.createError("Phrases array must be provided and cannot be empty", 400);
    }
    for (const phrase of phrasesArr) {
        if (!phrase.englishText && !phrase.yorubaText) {
            throw utilities_1.errorUtilities.createError("Each phrase must have either englishText or yorubaText", 400);
        }
    }
    const fetchRecordings = await services_1.adminServices.getPhrasesWithAllRecordingsForZabbotParallel(phrasesArr);
    return utilities_1.responseUtilities.responseHandler(response, fetchRecordings.message, fetchRecordings.statusCode, fetchRecordings.data);
};
exports.default = {
    adminCreatePhrase,
    adminUpdatesPhrase,
    adminDeletesPhrase,
    adminCreatesManyPhrases,
    adminDeletesCloudinaryLeftOverRecordings,
    adminGetsPhraseWithRecordingsForZabbot,
    adminGetsPhraseWithRecordingsForZabbotBatch
};
