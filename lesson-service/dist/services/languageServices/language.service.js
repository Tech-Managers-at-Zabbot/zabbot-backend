"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../../shared/utilities");
const language_repository_1 = __importDefault(require("../../repositories/language.repository"));
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const uuid_1 = require("uuid");
const getLanguages = utilities_1.errorUtilities.withServiceErrorHandling(async (params) => {
    const languages = await language_repository_1.default.getLanguages(params);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "success", languages);
});
const getLanguage = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    const language = await language_repository_1.default.getLanguage(id);
    if (!language) {
        throw utilities_1.errorUtilities.createError(`Language not found`, 404);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "success", language);
});
const addLanguage = utilities_1.errorUtilities.withServiceErrorHandling(async (languageData) => {
    // Check if the language already exists
    const currentLanguage = await language_repository_1.default.getLanguageByCode(languageData.code);
    if (currentLanguage) {
        throw utilities_1.errorUtilities.createError(`Language with code ${languageData.code} already exists`, 400);
    }
    languageData.title = languageData.title.charAt(0).toUpperCase() + languageData.title.slice(1);
    const newLanguagePayload = {
        ...languageData,
        id: (0, uuid_1.v4)(),
        createdAt: new Date(),
    };
    const newLanguage = await language_repository_1.default.addLanguage(newLanguagePayload);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, "Language created successfully", newLanguage);
});
const updateLanguage = utilities_1.errorUtilities.withServiceErrorHandling(async (id, languageData) => {
    const language = await language_repository_1.default.getLanguage(id);
    if (!language) {
        throw utilities_1.errorUtilities.createError(`Language not found`, 404);
    }
    language.title = languageData.title;
    language.code = languageData.code;
    const updatedLanguage = await language_repository_1.default.updateLanguage(language);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "Language updated successfully", updatedLanguage);
});
const changeLanguageStatus = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    const updatedLanguage = await language_repository_1.default.toggleLanguageStatus(id);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.NoContent, "Language status updated successfully", updatedLanguage);
});
//Logic to check if the language can be deleted has not been implemented yet.
// For now, it will just delete the language if it exists.
// This logic should also check if the language is associated with any userLessons before deletion.
const deleteLanguage = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    const language = await language_repository_1.default.getLanguage(id);
    if (!language) {
        throw utilities_1.errorUtilities.createError(`Language not found`, 404);
    }
    await language_repository_1.default.deleteLanguage(id);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.NoContent, "Language deleted successfully", null);
});
exports.default = {
    getLanguages,
    getLanguage,
    addLanguage,
    updateLanguage,
    changeLanguageStatus,
    deleteLanguage
};
