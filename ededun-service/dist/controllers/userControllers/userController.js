"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../../services");
const utilities_1 = require("../../utilities");
const userAddsRecording = async (request, response) => {
    const { id } = request.user;
    const phraseId = request.body.phraseId;
    const audioFile = request.files?.audio?.[0];
    if (!audioFile) {
        throw utilities_1.errorUtilities.createError('No audio file recorded', 400);
    }
    const recordingUrl = audioFile.path;
    const payload = {
        userId: id,
        phraseId,
        recordingUrl
    };
    const newRecording = await services_1.userServices.addRecording(payload);
    return utilities_1.responseUtilities.responseHandler(response, newRecording.message, newRecording.statusCode, newRecording.data);
};
const userGetsAllTheirRecordings = async (request, response) => {
    const { id } = request.user;
    const { page } = request.query;
    const userRecordings = await services_1.userServices.getAllMyRecordings(id, page);
    return utilities_1.responseUtilities.responseHandler(response, userRecordings.message, userRecordings.statusCode, userRecordings.data);
};
const userGetsUnrecordedPhrases = async (request, response) => {
    const { id } = request.user;
    const { page } = request.query;
    const unrecordedPhrases = await services_1.userServices.getAllMyUnrecordedPhrases(id, page);
    return utilities_1.responseUtilities.responseHandler(response, unrecordedPhrases.message, unrecordedPhrases.statusCode, unrecordedPhrases.data);
};
const userDeletesSingleRecording = async (request, response) => {
    const { recordingId } = request.params;
    const unrecordedPhrases = await services_1.userServices.deleteMyRecordings(recordingId);
    return utilities_1.responseUtilities.responseHandler(response, unrecordedPhrases.message, unrecordedPhrases.statusCode, unrecordedPhrases.data);
};
exports.default = {
    userAddsRecording,
    userGetsAllTheirRecordings,
    userGetsUnrecordedPhrases,
    userDeletesSingleRecording
};
