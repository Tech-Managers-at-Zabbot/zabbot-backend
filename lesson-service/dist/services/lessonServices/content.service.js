"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lesson_repository_1 = __importDefault(require("../../repositories/lesson.repository"));
const utilities_1 = require("../../../../shared/utilities");
const content_repository_1 = __importDefault(require("../../repositories/content.repository"));
const getContents = utilities_1.errorUtilities.withServiceErrorHandling(async () => {
    const getContents = await content_repository_1.default.getContents();
    return getContents;
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
        languageContentId: contentData.languageContentId,
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
    content.languageContentId = contentData.languageContentId;
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
    deleteContent
};
