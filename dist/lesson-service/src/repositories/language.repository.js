"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const language_1 = __importDefault(require("../entities/language"));
const languageRepositories = {
    getLanguages: async (filter) => {
        try {
            const where = {};
            if (typeof filter?.isActive === 'boolean') {
                where.isActive = filter.isActive;
            }
            const languages = await language_1.default.findAll({ where });
            return languages;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching languages: ${error.message}`, 500);
        }
    },
    getLanguage: async (id) => {
        try {
            const language = await language_1.default.findByPk(id);
            return language;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching language: ${error.message}`, 500);
        }
    },
    getLanguageByCode: async (code) => {
        try {
            const language = await language_1.default.findOne({ where: { code } });
            return language;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching language by code: ${error.message}`, 500);
        }
    },
    addLanguage: async (languageData, transaction) => {
        try {
            const newLanguage = await language_1.default.create(languageData, { transaction });
            return newLanguage;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Adding language: ${error.message}`, 500);
        }
    },
    updateLanguage: async (languageData, transaction) => {
        try {
            await languageData.update(languageData, { transaction });
            return languageData;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Updating language: ${error.message}`, 500);
        }
    },
    deleteLanguage: async (id) => {
        try {
            await language_1.default.destroy({ where: { id } });
            return { message: "Language deleted successfully" };
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Deleting language: ${error.message}`, 500);
        }
    },
    toggleLanguageStatus: async (id) => {
        const language = await language_1.default.findByPk(id);
        if (!language)
            throw utilities_1.errorUtilities.createError(`Language does not exist`, 404);
        if (language.isActive === undefined || language.isActive === null)
            language.isActive = true;
        language.isActive = !language.isActive;
        const updatedLanguage = await language_1.default.update(language, { where: { id } });
        return updatedLanguage;
    },
    addLanguageContent: async (languageContentData) => {
        try {
            languageContentData.createdAt = new Date();
            return languageContentData;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error creating a new language content: ${error.message}`, 500);
        }
    },
};
exports.default = languageRepositories;
