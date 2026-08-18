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
const quiz_repository_1 = __importDefault(require("../../repositories/quiz.repository"));
const api_1 = require("../../../../shared/cloudinary/api");
const course_repository_1 = __importDefault(require("../../repositories/course.repository"));
const databases_1 = require("../../../../config/databases");
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
    const course = await course_repository_1.default.getCourse(courseId);
    if (!getCourseLessons) {
        throw utilities_1.errorUtilities.createError(responses_1.CourseResponses.LESSONS_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    const getLessonsContents = await Promise.all(getCourseLessons.map(async (lesson) => {
        const contents = await content_repository_1.default.getLessonContents(lesson?.id);
        return {
            course: course || null,
            ...lesson,
            contents: contents || [],
        };
    }));
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, getLessonsContents);
});
const getLessonWithContents = utilities_1.errorUtilities.withServiceErrorHandling(async (lessonId) => {
    const lesson = await lesson_repository_1.default.getLesson(lessonId);
    if (!lesson) {
        throw utilities_1.errorUtilities.createError(`Lesson not found`, 404);
    }
    const contentsData = await content_repository_1.default.getLessonContents(lessonId);
    const contents = await Promise.all(contentsData.map(async (content) => {
        const contentFiles = await content_repository_1.default.getContentFiles(content.id);
        return {
            ...content,
            files: contentFiles,
        };
    }));
    const lessonQuizzes = await quiz_repository_1.default.getQuizzes({ lessonId });
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "Successful", { lesson, contents, lessonQuizzes });
});
const createLesson = utilities_1.errorUtilities.withServiceErrorHandling(async (lessonData) => {
    const { contents, languageId } = lessonData;
    const payload = {
        ...lessonData,
        id: (0, uuid_1.v4)(),
        createdAt: new Date(),
        lessonOutcomes: lessonData.outcomes,
        lessonObjectives: lessonData.objectives,
        estimatedDuration: lessonData.estimatedDuration || 0,
    };
    const newLesson = await lesson_repository_1.default.addLesson(payload);
    if (contents && contents.length > 0) {
        for (const contentData of contents) {
            // Create content
            const newContentData = {
                id: (0, uuid_1.v4)(),
                lessonId: newLesson.id,
                translation: contentData.translation,
                isGrammarRule: false,
                languageId,
                sourceType: contentData.sourceType,
                customText: contentData.customText,
                ededunPhrases: contentData.ededunPhrases,
                createdAt: new Date(),
            };
            await content_repository_1.default.createContent(newContentData);
            // Create content files
            if (contentData.contentFiles && contentData.contentFiles.length > 0) {
                for (const fileData of contentData.contentFiles) {
                    const contentFileData = {
                        id: (0, uuid_1.v4)(),
                        contentId: newContentData.id,
                        contentType: fileData.contentType,
                        filePath: fileData.filePath,
                        description: fileData.description || null,
                        createdAt: new Date(),
                    };
                    await content_repository_1.default.createContentFile(contentFileData);
                }
            }
        }
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, "Lesson created successfully", newLesson);
});
const updateLesson = utilities_1.errorUtilities.withServiceErrorHandling(async (id, lessonData) => {
    const lesson = await lesson_repository_1.default.getLesson(id);
    if (!lesson)
        throw utilities_1.errorUtilities.createError(`Lesson not found`, 404);
    lesson.updatedAt = new Date();
    lesson.title = lessonData.title;
    lesson.description = lessonData.description;
    const updatedLesson = await lesson_repository_1.default.updateLesson({
        ...lesson,
        ...lessonData,
    });
    return updatedLesson;
});
const updateLessonImageService = utilities_1.errorUtilities.withServiceErrorHandling(async (lessonId, mediaType, files) => {
    const lesson = await lesson_repository_1.default.getLesson(lessonId);
    if (!lesson) {
        throw utilities_1.errorUtilities.createError(`Lesson not found`, 404);
    }
    const category = "lesson-images";
    const uploadCourseImage = await (0, api_1.uploadFile)(category, mediaType, files);
    if (uploadCourseImage.status === "invalid") {
        throw utilities_1.errorUtilities.createError(uploadCourseImage.message, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    else if (uploadCourseImage.status === "error") {
        throw utilities_1.errorUtilities.createError(uploadCourseImage.message, statusCodes_responses_1.StatusCodes.InternalServerError);
    }
    const successfulUploads = uploadCourseImage.data.successful;
    const updateData = {
        lessonImg: successfulUploads[0].secure_url,
    };
    const update = await lesson_repository_1.default.newUpdateLesson(lessonId, updateData);
    if (!update) {
        throw utilities_1.errorUtilities.createError("Unable to update Lesson Image", statusCodes_responses_1.StatusCodes.BadRequest);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, "Lesson image updated successfully", update);
});
const deleteLesson = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    const lesson = await lesson_repository_1.default.getLesson(id);
    if (!lesson) {
        throw utilities_1.errorUtilities.createError(responses_1.CourseResponses.LESSON_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    await databases_1.users_service_db.transaction(async (transaction) => {
        await content_repository_1.default.deleteContentsByLessonIds([id], transaction);
        await quiz_repository_1.default.deleteQuizzesByLessonId(id, transaction);
        await lesson_repository_1.default.deleteLesson(id, transaction);
    });
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, null);
});
exports.default = {
    getLessons,
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    getLessonWithContents,
    getLessonsForLanguage,
    getLessonsForCourse,
    updateLessonImageService,
};
