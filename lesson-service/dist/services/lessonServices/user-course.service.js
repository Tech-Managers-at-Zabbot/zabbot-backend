"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_course_repository_1 = __importDefault(require("../../repositories/user-course.repository"));
const utilities_1 = require("../../../../shared/utilities");
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const responses_1 = require("../../responses/responses");
const getUserCourses = utilities_1.errorUtilities.withServiceErrorHandling(async (userId, languageId, courseId) => {
    const payload = { languageId, userId, courseId };
    const userCourses = await user_course_repository_1.default.getUserCourses(payload);
    return userCourses;
});
const getUserCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    const userCourse = await user_course_repository_1.default.getUserCourse(id);
    if (!userCourse) {
        throw utilities_1.errorUtilities.createError(responses_1.CourseResponses.USER_COURSE_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, userCourse);
});
const addUserCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (userCourseData) => {
    const existingUserCourse = await user_course_repository_1.default.getUserCourses({
        userId: userCourseData.userId,
        courseId: userCourseData.courseId,
        languageId: userCourseData.languageId
    });
    if (existingUserCourse.length > 0) {
        throw utilities_1.errorUtilities.createError(`User already enrolled in this course`, 400);
    }
    const newUserCourse = await user_course_repository_1.default.addUserCourse(userCourseData);
    return newUserCourse;
});
const updateUserCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (id, userCourseData) => {
    const userCourse = await user_course_repository_1.default.getUserCourse(id);
    if (!userCourse) {
        throw utilities_1.errorUtilities.createError(`User course not found`, 404);
    }
    // Update the user course with new data
    Object.assign(userCourse, userCourseData);
    const updatedUserCourse = await user_course_repository_1.default.updateUserCourse(userCourse);
    return updatedUserCourse;
});
const deleteUserCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (id) => {
    await user_course_repository_1.default.deleteUserCourse(id);
    return { message: "User course deleted successfully" };
});
exports.default = {
    getUserCourses,
    getUserCourse,
    addUserCourse,
    updateUserCourse,
    deleteUserCourse
};
