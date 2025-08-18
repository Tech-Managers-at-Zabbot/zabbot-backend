"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const content_1 = __importDefault(require("../../../shared/entities/lesson-service-entities/content/content"));
const utilities_1 = require("../../../shared/utilities");
const content_file_1 = __importDefault(require("../../../shared/entities/lesson-service-entities/contentFile/content-file"));
const contentRepositories = {
    // CRUD CONTENTS SESSION START
    getContents: async () => {
        try {
            const contents = await content_1.default.findAll();
            return contents;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error fetching contents ${error.message}`, 500);
        }
    },
    getContent: async (id) => {
        try {
            const content = await content_1.default.findByPk(id);
            return content;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error fetching content: ${error.message}`, 500);
        }
    },
    getLessonContents: async (lessonId) => {
        try {
            const contents = await content_1.default.findAll({ where: { lessonId }, raw: true });
            return contents;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error fetching contents for this lesson: ${error.message}`, 500);
        }
    },
    getLanguageContents: async (languageId) => {
        try {
            const contents = await content_1.default.findAll({ where: { languageId }, raw: true });
            return contents;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error fetching contents for this language: ${error.message}`, 500);
        }
    },
    createContent: async (contentData, transaction) => {
        try {
            // Create a new content
            const newContent = await content_1.default.create(contentData, { transaction });
            return newContent;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error creating a new content: ${error.message}`, 500);
        }
    },
    updateContent: async (contentData, transaction) => {
        try {
            // Update the content
            const updatedContent = await contentData.update(contentData, { transaction });
            return updatedContent;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error updating content: ${error.message}`, 500);
        }
    },
    deleteContent: async (id) => {
        try {
            // Check if the content exists
            const currentContent = await content_1.default.findByPk(id);
            if (!currentContent) {
                throw utilities_1.errorUtilities.createError(`Content does not exist`, 404);
            }
            // Delete the content
            await content_1.default.destroy({ where: { id } });
            return { message: "Content deleted successfully" };
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error deleting content: ${error.message}`, 500);
        }
    },
    // CRUD CONTENTS SESSION END
    getContentFiles: async (contentId) => {
        try {
            const contentFiles = await content_file_1.default.findAll({ where: { contentId }, raw: true });
            return contentFiles;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error fetching files for this content: ${error.message}`, 500);
        }
    },
    createContentFile: async (contentFileData, transaction) => {
        try {
            const newContentFile = await content_file_1.default.create(contentFileData, { transaction });
            return newContentFile;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error creating content file: ${error.message}`, 500);
        }
    },
};
exports.default = contentRepositories;
