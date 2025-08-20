"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const user_course_1 = __importDefault(require("../../../shared/entities/lesson-service-entities/userCourse/user-course"));
const userCourseRepositories = {
    getUserCourses: async (filter, projection) => {
        try {
            const where = {
                languageId: filter?.languageId, userId: filter?.userId, isActive: true
            };
            if (filter?.courseId) {
                where.courseId = filter.courseId;
            }
            const userCourses = await user_course_1.default.findAll({
                where,
                attributes: projection,
                order: [['lastAccessed', 'DESC']],
                raw: true
            });
            return userCourses;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching user courses: ${error.message}`, 500);
        }
    },
    getUserCourse: async (id) => {
        try {
            const userCourse = await user_course_1.default.findByPk(id);
            return userCourse;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching user course: ${error.message}`, 500);
        }
    },
    addUserCourse: async (userCourseData, transaction) => {
        try {
            // Create a new user course
            const newUserCourse = await user_course_1.default.create(userCourseData, { transaction });
            return newUserCourse;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Adding user course: ${error.message}`, 500);
        }
    },
    updateUserCourse: async (userCourseData, transaction) => {
        try {
            // Update the user course
            await userCourseData.update(userCourseData, { transaction });
            return userCourseData;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Updating user course: ${error.message}`, 500);
        }
    },
    deleteUserCourse: async (id) => {
        try {
            const userCourse = await user_course_1.default.findByPk(id);
            if (!userCourse) {
                throw utilities_1.errorUtilities.createError(`User course not found`, 404);
            }
            await userCourse.destroy();
            return { message: "User course deleted successfully" };
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Deleting user course: ${error.message}`, 500);
        }
    },
};
exports.default = userCourseRepositories;
