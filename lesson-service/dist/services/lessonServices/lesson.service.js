"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const lesson_repository_1 = __importDefault(require("../../repositories/lesson.repository"));
const utilities_1 = require("../../../../shared/utilities");
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const content_repository_1 = __importDefault(require("../../repositories/content.repository"));
const responses_1 = require("../../responses/responses");
// import languageRepositories from "src/repositories/language.repository";
const getLessons = utilities_1.errorUtilities.withServiceErrorHandling(async () => {
    const lessons = await lesson_repository_1.default.getLessons();
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "", lessons);
});
const getLesson = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    const lesson = await lesson_repository_1.default.getLesson(id);
    if (!lesson) {
        throw utilities_1.errorUtilities.createError(`Lesson not found`, 404);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "", lesson);
});
const getLessonsForLanguage = utilities_1.errorUtilities.withServiceErrorHandling(async (languageId) => {
    const getLanguageLessons = await lesson_repository_1.default.getLanguageLessons(languageId);
    if (!getLanguageLessons) {
        throw utilities_1.errorUtilities.createError(responses_1.CourseResponses.LESSONS_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, getLanguageLessons);
});
const getLessonsForCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (courseId) => {
    const getCourseLessons = await lesson_repository_1.default.getLessons({ courseId });
    if (!getCourseLessons) {
        throw utilities_1.errorUtilities.createError(responses_1.CourseResponses.LESSONS_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    const getLessonsContents = await Promise.all(getCourseLessons.map(async (lesson) => {
        const contents = await content_repository_1.default.getLessonContents(lesson?.id);
        return {
            ...lesson,
            contents: contents || []
        };
    }));
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, getLessonsContents);
});
const getLessonWithContents = utilities_1.errorUtilities.withServiceErrorHandling(async (lessonId) => {
    const lesson = await lesson_repository_1.default.getLesson(lessonId);
    if (!lesson) {
        throw utilities_1.errorUtilities.createError(`Lesson not found`, 404);
    }
    const contents = await content_repository_1.default.getLessonContents(lessonId);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "Successful", { lesson, contents });
});
const createLesson = utilities_1.errorUtilities.withServiceErrorHandling(async (lessonData) => {
    const payload = {
        ...lessonData,
        id: (0, uuid_1.v4)(),
        createdAt: new Date(),
        lessonOutcomes: lessonData.outcomes,
        lessonObjectives: lessonData.objectives,
        estimatedDuration: lessonData.estimatedDuration || 0,
    };
    const newLesson = await lesson_repository_1.default.addLesson(payload);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, "Lesson created successfully", newLesson);
});
const updateLesson = utilities_1.errorUtilities.withServiceErrorHandling(async (id, lessonData) => {
    const lesson = await lesson_repository_1.default.getLesson(id);
    if (!lesson)
        throw utilities_1.errorUtilities.createError(`Lesson not found`, 404);
    lesson.updatedAt = new Date();
    lesson.title = lessonData.title;
    lesson.description = lessonData.description;
    const updatedLesson = await lesson_repository_1.default.updateLesson(lesson);
    return updatedLesson;
});
//Logic for deleting a lesson is not ready yet
// const deleteLesson = errorUtilities.withServiceErrorHandling(
//   async (id: string) => {
//     const deletedLesson = await lessonRepositories.deleteLesson(id);
//     if (!deletedLesson) {
//       throw errorUtilities.createError(`Lesson not found`, 404);
//     }
//     return deletedLesson;
//   }
// );
// Add this to your course service exports:
exports.default = {
    getLessons,
    getLesson,
    createLesson,
    updateLesson,
    getLessonWithContents,
    getLessonsForLanguage,
    getLessonsForCourse
};
