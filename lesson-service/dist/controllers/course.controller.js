"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCourseWithLessonsController = exports.removeUserCourseController = exports.updateUserCourseController = exports.addUserCourseController = exports.getUserCourseController = exports.getUserCoursesController = exports.deleteCourseController = exports.updateCourseController = exports.addCourseController = exports.getCourseByTitleController = exports.getCourseController = exports.getCoursesController = void 0;
const course_service_1 = __importDefault(require("../services/lessonServices/course.service"));
const user_course_service_1 = __importDefault(require("../services/lessonServices/user-course.service"));
const utilities_1 = require("../../../shared/utilities");
// Controller to get all courses
exports.getCoursesController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { languageId } = req.params;
    const { isActive } = req.query;
    // const isActive: boolean | null = req.query.isActive === 'true' ? true
    //   : req.query.isActive === 'false' ? false
    //   : true;
    const courses = await course_service_1.default.getCoursesForLanguage(isActive, languageId);
    return utilities_1.responseUtilities.responseHandler(res, courses.message, courses.statusCode, courses.data);
});
// Controller to get a single course
exports.getCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const course = await course_service_1.default.getCourse(id);
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
exports.getUserCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const userCourse = await user_course_service_1.default.getUserCourse(req.params);
    return utilities_1.responseUtilities.responseHandler(res, userCourse.message, userCourse.statusCode, userCourse.data);
});
// Controller to add user to course
exports.addUserCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { title } = req.params;
    const addUserCourse = await user_course_service_1.default.addUserCourse(title);
    return utilities_1.responseUtilities.responseHandler(res, addUserCourse.message, addUserCourse.statusCode, addUserCourse.data);
});
// Controller to update user course
exports.updateUserCourseController = utilities_1.errorUtilities.withControllerErrorHandling(async (req, res) => {
    const { id } = req.params;
    const { userCourseData } = req.body;
    const updateUserCourse = await user_course_service_1.default.updateUserCourse(id, userCourseData);
    return utilities_1.responseUtilities.responseHandler(res, updateUserCourse.message, updateUserCourse.statusCode, updateUserCourse.data);
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
