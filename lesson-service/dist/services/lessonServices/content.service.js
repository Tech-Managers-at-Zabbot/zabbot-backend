"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lesson_repository_1 = __importDefault(require("../../repositories/lesson.repository"));
const utilities_1 = require("../../../../shared/utilities");
const content_repository_1 = __importDefault(require("../../repositories/content.repository"));
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const responses_1 = require("../../responses/responses");
const getContents = utilities_1.errorUtilities.withServiceErrorHandling(async () => {
    const getContents = await content_repository_1.default.getContents();
    if (!getContents) {
        throw utilities_1.errorUtilities.createError(responses_1.CourseResponses.CONTENTS_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, getContents);
});
const getContentsForLanguage = utilities_1.errorUtilities.withServiceErrorHandling(async (languageId) => {
    const getLanguageContents = await content_repository_1.default.getLanguageContents(languageId);
    if (!getLanguageContents) {
        throw utilities_1.errorUtilities.createError(responses_1.CourseResponses.CONTENTS_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, getLanguageContents);
});
const getContent = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    const content = await content_repository_1.default.getContent(id);
    if (!content) {
        throw utilities_1.errorUtilities.createError(`Content not found`, 404);
    }
    return content;
});
const getLessonContents = utilities_1.errorUtilities.withServiceErrorHandling(async (lessonId) => {
    const lesson = await lesson_repository_1.default.getLesson(lessonId);
    if (!lesson)
        throw utilities_1.errorUtilities.createError(`Lesson not found`, 404);
    const contents = await content_repository_1.default.getLessonContents(lessonId);
    return contents;
});
const addContent = utilities_1.errorUtilities.withServiceErrorHandling(async (contentData) => {
    const lesson = await lesson_repository_1.default.getLesson(contentData.lessonId);
    if (!lesson)
        throw utilities_1.errorUtilities.createError(`Lesson not found`, 404);
    const payload = {
        lessonId: contentData.lessonId,
        languageId: contentData.languageId,
        translation: contentData.translation,
        level: contentData.level,
        createdAt: new Date()
    };
    const newContent = await content_repository_1.default.createContent(payload);
    return newContent;
});
const updateContent = utilities_1.errorUtilities.withServiceErrorHandling(async (id, contentData) => {
    const content = await content_repository_1.default.getContent(id);
    if (!content) {
        throw utilities_1.errorUtilities.createError(`Content not found`, 404);
    }
    content.lessonId = contentData.lessonId;
    content.languageId = contentData.languageId;
    content.translation = contentData.translation;
    content.updatedAt = new Date();
    const updatedContent = await content_repository_1.default.updateContent(content);
    return updatedContent;
});
const deleteContent = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    const content = await content_repository_1.default.getContent(id);
    if (!content) {
        throw utilities_1.errorUtilities.createError(`Content not found`, 404);
    }
    await content_repository_1.default.deleteContent(id);
    return { message: "Content deleted successfully" };
});
exports.default = {
    getContents,
    getContent,
    getLessonContents,
    addContent,
    updateContent,
    deleteContent,
    getContentsForLanguage
};
