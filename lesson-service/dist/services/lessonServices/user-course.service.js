"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_course_repository_1 = __importDefault(require("../../repositories/user-course.repository"));
const utilities_1 = require("../../../../shared/utilities");
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const responses_1 = require("../../responses/responses");
const uuid_1 = require("uuid");
// import courseService from "./course.service";
const getUserCourses = utilities_1.errorUtilities.withServiceErrorHandling(async (userId, languageId, courseId) => {
    const payload = { languageId, userId, courseId };
    const userCourses = await user_course_repository_1.default.getUserCourses(payload);
    return userCourses;
});
const getUserCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (languageId, userId, courseId) => {
    const userCourse = await user_course_repository_1.default.getUserCourse({
        languageId,
        userId,
        courseId,
    });
    if (!userCourse) {
        throw utilities_1.errorUtilities.createError(responses_1.CourseResponses.USER_COURSE_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, userCourse);
});
// const getUserCourseAndLessons = errorUtilities.withServiceErrorHandling (
//   async (courseId: string, userId:string) => {
//     const userCourse = await userCourseRepositories.getUserCourseWithUserId(courseId, userId);
//     if (!userCourse) {
//         throw errorUtilities.createError(CourseResponses.USER_COURSE_NOT_FOUND, StatusCodes.NotFound);
//     }
//     const course = await courseService.getCourseWithLessons(userCourse.courseId);
//      return responseUtilities.handleServicesResponse(
//           StatusCodes.OK,
//           CourseResponses.PROCESS_SUCCESSFUL,
//           course.data
//         );
//   }
// );
const addUserCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (userCourseData) => {
    const existingUserCourse = await user_course_repository_1.default.getUserCourse({
        userId: userCourseData.userId,
        courseId: userCourseData.courseId,
        languageId: userCourseData.languageId,
    });
    if (existingUserCourse) {
        throw utilities_1.errorUtilities.createError(responses_1.CourseResponses.USER_ENROLLED_FOR_COURSE, statusCodes_responses_1.StatusCodes.BadRequest);
    }
    const newUserCourse = await user_course_repository_1.default.addUserCourse({
        id: (0, uuid_1.v4)(),
        ...userCourseData,
    });
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, newUserCourse);
});
const getUserCompletedCoursesService = utilities_1.errorUtilities.withServiceErrorHandling(async (userId, languageId, countOnly) => {
    const userCompletedCourses = await user_course_repository_1.default.getCompletedCourses(userId, languageId, countOnly);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, userCompletedCourses);
});
const updateUserCourse = utilities_1.errorUtilities.withServiceErrorHandling(async (courseId, userId, userCourseData) => {
    const userCourse = await user_course_repository_1.default.getUserCourse({
        userId: userId,
        courseId: courseId,
    });
    if (!userCourse) {
        throw utilities_1.errorUtilities.createError(responses_1.CourseResponses.USER_COURSE_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    if (userCourse.isCompleted && userCourse.progress === 100) {
        return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, userCourse);
    }
    Object.assign(userCourse, userCourseData);
    const updatedUserCourse = await user_course_repository_1.default.updateUserCourse(userCourse, userCourse.id);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.CourseResponses.PROCESS_SUCCESSFUL, updatedUserCourse);
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
    deleteUserCourse,
    getUserCompletedCoursesService,
    // getUserCourseAndLessons
};
