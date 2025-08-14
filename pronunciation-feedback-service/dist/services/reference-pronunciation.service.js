"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reference_pronunciation_repository_1 = __importDefault(require("../repositories/reference-pronunciation.repository"));
const utilities_1 = require("../../../shared/utilities");
const statusCodes_responses_1 = require("../../../shared/statusCodes/statusCodes.responses");
const uuid_1 = require("uuid");
const getPronunciations = utilities_1.errorUtilities.withServiceErrorHandling(async () => {
    const pronunciations = await reference_pronunciation_repository_1.default.getPronunciations();
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "success", pronunciations);
});
const getPronunciation = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    const pronunciation = await reference_pronunciation_repository_1.default.getPronunciation(id);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "success", pronunciation);
});
const addPronunciation = utilities_1.errorUtilities.withServiceErrorHandling(async (pronunciationData) => {
    const newPronunciaitonData = {
        ...pronunciationData,
        id: (0, uuid_1.v4)(),
        createdAt: new Date(),
    };
    const newPronunciation = await reference_pronunciation_repository_1.default.addPronunciation(newPronunciaitonData);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, "Pronunciation created successfully", newPronunciation);
});
const updatePronunciation = utilities_1.errorUtilities.withServiceErrorHandling(async (id, pronunciationData) => {
    const pronunciation = await reference_pronunciation_repository_1.default.getPronunciation(id);
    if (!pronunciation) {
        throw utilities_1.errorUtilities.createError(`Pronunciation not found`, 404);
    }
    const updatedPronunciation = await reference_pronunciation_repository_1.default.updatePronunciation(pronunciationData);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "Pronunciation updated successfully", updatedPronunciation);
});
const deletePronunciation = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    const pronunciation = await reference_pronunciation_repository_1.default.getPronunciation(id);
    if (!pronunciation) {
        throw utilities_1.errorUtilities.createError(`Pronunciation not found`, 404);
    }
    await reference_pronunciation_repository_1.default.deletePronunciation(id);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.NoContent, "Pronunciation deleted successfully", null);
});
exports.default = {
    getPronunciations,
    getPronunciation,
    addPronunciation,
    updatePronunciation,
    deletePronunciation,
};
