"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const language_1 = __importDefault(require("../../../shared/entities/lesson-service-entities/language/language"));
// import LanguageContents from "../entities/language-content";
const languageRepositories = {
    // LANGUAGE SESSION START
    getLanguages: async (filter) => {
        try {
            const where = {};
            if (typeof filter?.isActive === 'boolean') {
                where.isActive = filter.isActive;
            }
            // Pass it straight to Sequelize
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
            // Create a new language
            const newLanguage = await language_1.default.create(languageData, { transaction });
            return newLanguage;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Adding language: ${error.message}`, 500);
        }
    },
    updateLanguage: async (languageData, transaction) => {
        try {
            // Update the language
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
    // END LANGUAGE SESSION
    // TOGGLE LANGUAGE STATUS
    toggleLanguageStatus: async (id) => {
        const language = await language_1.default.findByPk(id);
        if (!language)
            throw utilities_1.errorUtilities.createError(`Language does not exist`, 404);
        if (language.isActive === undefined || language.isActive === null)
            language.isActive = true;
        language.isActive = !language.isActive;
        // Update the language
        const updatedLanguage = await language_1.default.update(language, { where: { id } });
        return updatedLanguage;
    },
    // SESSION FOR LANGUAGE CONTENTS
    // getLanguageContents: async (filter?: { languageId?: string}) => {
    //   try {
    //     const where: any = {}
    //     if (typeof filter?.languageId === 'string')
    //       where.languageId = filter?.languageId
    //     const languageContents = await LanguageContents.findAll({ where });
    //     return languageContents;
    //   } catch (error: any) {
    //     throw errorUtilities.createError(`Error fetching language contents: ${error.message}`, 500);
    //   }
    // },
    // getLanguageContent: async (id: string) => {
    //   try {
    //     const languageContent = await LanguageContents.findByPk(id);
    //     return languageContent;
    //   } catch (error: any) {
    //     throw errorUtilities.createError(`Error fetching contents for this language: ${error.message}`, 500);
    //   }
    // },
    addLanguageContent: async (languageContentData) => {
        try {
            // Create a new language content
            languageContentData.createdAt = new Date();
            return languageContentData;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error creating a new language content: ${error.message}`, 500);
        }
    },
    // updateLanguageContent: async (id: string, languageContentData: any) => {
    //   try {
    //     // currentLanguageContent.title = languageContentData.title;
    //     // currentLanguageContent.word = languageContentData.word;
    //     // currentLanguageContent.tone = languageContentData.tone;
    //     languageContentData.updatedAt = new Date();
    //     // Update the language content
    //     const updatedLanguageContent = await LanguageContents.update( languageContentData, { where: { id } });
    //     return updatedLanguageContent;
    //   } catch (error: any) {
    //     throw errorUtilities.createError(`Error Updating language content: ${error.message}`, 500);
    //   }
    // },
    // deleteLanguageContent: async(id: string) => {
    //   try{
    //     await LanguageContents.destroy({ where: { id }});
    //     return { message: "Language content deleted successfully"};
    //   } catch (error) {
    //     throw errorUtilities.createError(`Error deleting Language content`, 500);
    //   }
    // }
    // END LANGUAGE CONTENTS SESSION
};
exports.default = languageRepositories;
