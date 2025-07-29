"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const course_repository_1 = __importDefault(require("../../repositories/course.repository"));
const utilities_1 = require("../../../../shared/utilities");
const uuid_1 = require("uuid");
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const content_repository_1 = __importDefault(require("../../repositories/content.repository"));
const lesson_repository_1 = __importDefault(require("../../repositories/lesson.repository"));
const responses_1 = require("../../responses/responses");
const getCoursesForLanguage = utilities_1.errorUtilities.withServiceErrorHandling(async (languageId, isActive) => {
    const payload = { isActive, languageId };
    const courses = await course_repository_1.default.getCourses(isActive, languageId);
    if (!courses) {
        throw utilities_1.errorUtilities.createError(responses_1.CourseResponses.COURSES_NOT_FETCHED, statusCodes_responses_1.StatusCodes.NotFound);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, courses);
});
const getCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    const course = await course_repository_1.default.getCourse(id);
    if (!course) {
        throw utilities_1.errorUtilities.createError(`Course not found`, 404);
    }
    return course;
});
const getCourseByTitle = utilities_1.errorUtilities.withServiceErrorHandling(async (title) => {
    const course = await course_repository_1.default.getCourseByTitle(title);
    if (!course) {
        throw utilities_1.errorUtilities.createError(`Course with title ${title} not found`, 404);
    }
    return course;
});
const addCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (courseData) => {
    const existingCourse = await course_repository_1.default.getCourseByTitle(courseData.title);
    if (existingCourse) {
        throw utilities_1.errorUtilities.createError(`Course with title ${courseData.title} already exists`, 400);
    }
    const newCourse = await course_repository_1.default.addCourse(courseData);
    return newCourse;
});
const updateCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (id, courseData) => {
    const course = await course_repository_1.default.getCourse(id);
    if (!course) {
        throw utilities_1.errorUtilities.createError(`Course not found`, 404);
    }
    // Update the course with new data
    Object.assign(course, courseData);
    const updatedCourse = await course_repository_1.default.updateCourse(course);
    return updatedCourse;
});
const deleteCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    await course_repository_1.default.deleteCourse(id);
    return { message: "Course deleted successfully" };
});
const createCourseWithLessons = utilities_1.errorUtilities.withServiceErrorHandling(async (courseData, lessons, languageId) => {
    // const { lessons, languageId, ...courseData } = coursePayload;
    // Create course
    const newCourseData = {
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        estimatedDuration: courseData.estimatedDuration,
        thumbnailImage: courseData.thumbnailImage,
        id: (0, uuid_1.v4)(),
        isActive: true,
        languageId,
        createdAt: new Date(),
        totalLessons: lessons?.length || 0,
        totalContents: lessons?.reduce((total, lesson) => total + (lesson.contents?.length || 0), 0) || 0
    };
    const newCourse = await course_repository_1.default.addCourse(newCourseData);
    if (lessons && lessons.length > 0) {
        for (const lessonData of lessons) {
            const { contents, ...lesson } = lessonData;
            // Create lesson
            const newLessonData = {
                ...lesson,
                id: (0, uuid_1.v4)(),
                courseId: newCourseData.id,
                createdAt: new Date(),
                totalContents: contents?.length || 0,
                outcomes: lesson.outcomes,
                objectives: lesson.objectives,
                estimatedDuration: lesson.estimatedTime || 0,
                headLineTag: lesson.headlineTag
            };
            const createdLesson = await lesson_repository_1.default.addLesson(newLessonData);
            if (contents && contents.length > 0) {
                for (const contentData of contents) {
                    // Create content
                    const newContentData = {
                        id: (0, uuid_1.v4)(),
                        lessonId: newLessonData.id,
                        translation: contentData.translation,
                        isGrammarRule: false,
                        sourceType: contentData.sourceType,
                        customText: contentData.customText,
                        ededunPhrases: contentData.ededunPhrases,
                        createdAt: new Date()
                    };
                    const createdContent = await content_repository_1.default.createContent(newContentData);
                    // Create content files
                    if (contentData.contentFiles && contentData.contentFiles.length > 0) {
                        for (const fileData of contentData.contentFiles) {
                            const contentFileData = {
                                id: (0, uuid_1.v4)(),
                                contentId: newContentData.id,
                                contentType: fileData.contentType,
                                filePath: fileData.filePath,
                                description: fileData.description || null,
                                createdAt: new Date()
                            };
                            await content_repository_1.default.createContentFile(contentFileData);
                        }
                    }
                }
            }
        }
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, "Course created successfully with lessons", newCourse);
});
exports.default = {
    getCoursesForLanguage,
    getCourse,
    getCourseByTitle,
    addCourse,
    updateCourse,
    deleteCourse,
    createCourseWithLessons
};
