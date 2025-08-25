"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCourseWithLessonsController = exports.removeUserCourseController = exports.getCourseWithLessonsController = exports.getUserCompletedCoursesController = exports.updateUserCourseController = exports.addUserCourseController = exports.getUserCourseController = exports.getUserCoursesController = exports.deleteCourseController = exports.updateCourseController = exports.addCourseController = exports.getCourseByTitleController = exports.getCourseController = exports.getCoursesController = void 0;
const course_service_1 = __importDefault(require("../services/lessonServices/course.service"));
const user_course_service_1 = __importDefault(require("../services/lessonServices/user-course.service"));
const utilities_1 = require("../../../shared/utilities");
// Controller to get all courses
exports.getCoursesController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { languageId } = req.params;
    const { isActive } = req.query;
    const courses = await course_service_1.default.getCoursesForLanguage(languageId, isActive);
    return utilities_1.responseUtilities.responseHandler(res, courses.message, courses.statusCode, courses.data);
});
// Controller to get a single course
exports.getCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { courseId } = req.params;
    let { projections } = req.query;
    const newProjections = JSON.parse(projections);
    if (!Array.isArray(newProjections)) {
        projections = projections ? [projections] : undefined;
    }
    const course = await course_service_1.default.getCourse(courseId, newProjections);
    return utilities_1.responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
});
// Controller to get a course by title
exports.getCourseByTitleController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { title } = req.params;
    const course = await course_service_1.default.getCourseByTitle(title);
    return utilities_1.responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
});
// Controller to create a new course
exports.addCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const payload = req.body;
    const course = await course_service_1.default.addCourse(payload);
    return utilities_1.responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
});
// Controller to update an existing course
exports.updateCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const course = await course_service_1.default.updateCourse(id, payload);
    return utilities_1.responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
});
// Controller to delete a course
exports.deleteCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const course = await course_service_1.default.deleteCourse(id);
    return utilities_1.responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
});
// Controller to get all user courses
exports.getUserCoursesController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const userCourses = await user_course_service_1.default.getUserCourses(req.query);
    return utilities_1.responseUtilities.responseHandler(res, userCourses.message, userCourses.statusCode, userCourses.data);
});
// Controller to get user course
exports.getUserCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { userId } = request?.user;
    const { languageId, courseId } = request.params;
    const { lastLessonId } = request.query;
    const userCourse = await user_course_service_1.default.getUserCourse(languageId, userId, courseId, lastLessonId);
    return utilities_1.responseUtilities.responseHandler(response, userCourse.message, userCourse.statusCode, userCourse.data);
});
// Controller to add user to course
exports.addUserCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { languageId, courseId } = request.params;
    const { userId } = request.user;
    const userCourseData = {
        ...request.body,
        userId,
        languageId,
        courseId,
        lastAccessed: new Date(),
        isCompleted: false,
        isActive: true,
    };
    console.log('userCourseDataController', userCourseData);
    const addUserCourse = await user_course_service_1.default.addUserCourse(userCourseData);
    return utilities_1.responseUtilities.responseHandler(response, addUserCourse.message, addUserCourse.statusCode, addUserCourse.data);
});
// Controller to update user course
exports.updateUserCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { courseId } = request.params;
    const { userId } = request.user;
    const lessonId = request.body.lastLessonId;
    const updateUserCourse = await user_course_service_1.default.updateUserCourse(courseId, userId, request.body, lessonId);
    return utilities_1.responseUtilities.responseHandler(response, updateUserCourse.message, updateUserCourse.statusCode, updateUserCourse.data);
});
exports.getUserCompletedCoursesController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { userId } = request.user;
    const { languageId } = request.params;
    const { countOnly } = request.query;
    const userCompletedCourses = await user_course_service_1.default.getUserCompletedCoursesService(userId, languageId, countOnly);
    return utilities_1.responseUtilities.responseHandler(response, userCompletedCourses.message, userCompletedCourses.statusCode, userCompletedCourses.data);
});
exports.getCourseWithLessonsController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { languageId } = req.params;
    const courseWithLessons = await course_service_1.default.getCourseWithLessonsService(languageId);
    return utilities_1.responseUtilities.responseHandler(res, courseWithLessons.message, courseWithLessons.statusCode, courseWithLessons.data);
});
exports.removeUserCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const removeUserFromCourse = await user_course_service_1.default.deleteUserCourse(id);
    return utilities_1.responseUtilities.responseHandler(res, removeUserFromCourse.message, removeUserFromCourse.statusCode, removeUserFromCourse.data);
});
exports.createCourseWithLessonsController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { courseData, lessons } = req.body;
    const { languageId } = req.params;
    const course = await course_service_1.default.createCourseWithLessons(courseData, lessons, languageId);
    return utilities_1.responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
});
