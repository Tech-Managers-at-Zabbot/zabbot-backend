"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const content_1 = __importDefault(require("../../../shared/entities/lesson-service-entities/content/content"));
const utilities_1 = require("../../../shared/utilities");
const content_file_1 = __importDefault(require("../../../shared/entities/lesson-service-entities/contentFile/content-file"));
const sequelize_1 = require("sequelize");
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
    // getLessonContents: async (lessonId: string) => {
    //   try {
    //     const contents = await Contents.findAll({ where: { lessonId }, raw: true });
    //     return contents;
    //   } catch (error: any) {
    //     throw errorUtilities.createError(`Error fetching contents for this lesson: ${error.message}`, 500);
    //   }
    // },
    getLessonContents: async (lessonId) => {
        try {
            const contents = await content_1.default.findAll({
                where: { lessonId },
                raw: true,
            });
            const sortedContents = contents.sort((a, b) => {
                const getPriority = (content) => {
                    if (content.contentType === "normal")
                        return 1;
                    if (content.isGrammarRule === true)
                        return 2;
                    if (content.contentType === "proverbs")
                        return 3;
                    return 4;
                };
                const priorityA = getPriority(a);
                const priorityB = getPriority(b);
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            });
            return sortedContents;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error fetching contents for this lesson: ${error.message}`, 500);
        }
    },
    getLanguageContents: async (languageId) => {
        try {
            const contents = await content_1.default.findAll({
                where: { languageId },
                raw: true,
            });
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
    updateContent: async (id, contentData, transaction) => {
        try {
            if (!id) {
                throw utilities_1.errorUtilities.createError("Content id is required", 400);
            }
            const payload = { ...contentData };
            delete payload.id;
            const [rowsUpdated, [updatedContent]] = await content_1.default.update(payload, {
                where: { id },
                returning: true,
                transaction,
            });
            if (rowsUpdated === 0) {
                throw utilities_1.errorUtilities.createError("No content updated", 400);
            }
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
    deleteContentsByLessonIds: async (lessonIds, transaction) => {
        try {
            const lessonIdsWhere = { lessonId: { [sequelize_1.Op.in]: lessonIds } };
            const contents = await content_1.default.findAll({
                where: lessonIdsWhere,
                attributes: ["id"],
                raw: true,
                transaction,
            });
            const contentIds = contents.map((content) => content.id);
            if (contentIds.length > 0) {
                const contentIdsWhere = { contentId: { [sequelize_1.Op.in]: contentIds } };
                await content_file_1.default.destroy({
                    where: contentIdsWhere,
                    transaction,
                });
            }
            await content_1.default.destroy({
                where: lessonIdsWhere,
                transaction,
            });
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error deleting contents for lessons: ${error.message}`, 500);
        }
    },
    // CRUD CONTENTS SESSION END
    getContentFiles: async (contentId) => {
        try {
            const contentFiles = await content_file_1.default.findAll({
                where: { contentId },
                raw: true,
            });
            return contentFiles;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error fetching files for this content: ${error.message}`, 500);
        }
    },
    getContentFilesById: async (id) => {
        try {
            const contentFile = await content_file_1.default.findByPk(id);
            return contentFile;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error fetching content file: ${error.message}`, 500);
        }
    },
    updateContentFile: async (id, contentFileData, transaction) => {
        try {
            if (!id) {
                throw utilities_1.errorUtilities.createError("Content file id is required", 400);
            }
            const payload = { ...contentFileData };
            delete payload.id;
            const [rowsUpdated, [updatedContentFile]] = await content_file_1.default.update(payload, {
                where: { id },
                returning: true,
                transaction,
            });
            if (rowsUpdated === 0) {
                throw utilities_1.errorUtilities.createError("No content file updated", 400);
            }
            return updatedContentFile;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error updating content file: ${error.message}`, 500);
        }
    },
    deleteContentFile: async (id, transaction) => {
        try {
            const currentContentFile = await content_file_1.default.findByPk(id, { transaction });
            if (!currentContentFile) {
                throw utilities_1.errorUtilities.createError("Content file does not exist", 404);
            }
            await content_file_1.default.destroy({ where: { id }, transaction });
            return { message: "Content file deleted successfully" };
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error deleting content file: ${error.message}`, 500);
        }
    },
    createContentFile: async (contentFileData, transaction) => {
        try {
            const newContentFile = await content_file_1.default.create(contentFileData, {
                transaction,
            });
            return newContentFile;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error creating content file: ${error.message}`, 500);
        }
    },
};
exports.default = contentRepositories;
