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
                languageId: filter?.languageId,
                userId: filter?.userId,
                isActive: true,
            };
            if (filter?.courseId) {
                where.courseId = filter.courseId;
            }
            const userCourses = await user_course_1.default.findAll({
                where,
                attributes: projection,
                order: [["lastAccessed", "DESC"]],
                raw: true,
            });
            return userCourses;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching user courses: ${error.message}`, 500);
        }
    },
    getUserCourse: async (filter, projection) => {
        try {
            const where = {
                isActive: true,
                lastLessonId: filter.lastLessonId,
                userId: filter.userId,
                courseId: filter.courseId
            };
            if (filter?.languageId) {
                where.languageId = filter.languageId;
            }
            const userCourse = await user_course_1.default.findOne({
                where,
                attributes: projection,
                raw: true,
            });
            return userCourse;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching user course: ${error.message}`, 500);
        }
    },
    getCompletedCourses: async (userId, languageId, countOnly) => {
        try {
            if (countOnly === "true") {
                const count = await user_course_1.default.count({
                    where: {
                        userId,
                        languageId,
                        isCompleted: true,
                    },
                });
                return count;
            }
            const { count, rows } = await user_course_1.default.findAndCountAll({
                where: {
                    userId,
                    languageId,
                    isCompleted: true,
                },
                raw: true,
            });
            return { count, data: rows };
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error fetching user courses: ${error.message}`, 500);
        }
    },
    addUserCourse: async (userCourseData, transaction) => {
        try {
            const newUserCourse = await user_course_1.default.create(userCourseData, {
                transaction,
            });
            return newUserCourse;
        }
        catch (error) {
            console.log('adding user course error', error);
            throw utilities_1.errorUtilities.createError(`Error Adding user course: ${error.message}`, 500);
        }
    },
    updateUserCourse: async (userCourseData, userCourseId, lessonId) => {
        try {
            if (!lessonId) {
                throw utilities_1.errorUtilities.createError("Lesson id is required", 400);
            }
            const [rowsUpdated, [updatedRecord]] = await user_course_1.default.update(userCourseData, {
                where: {
                    id: userCourseId,
                    userId: userCourseData.userId,
                    lastLessonId: lessonId,
                },
                returning: true,
            });
            if (rowsUpdated === 0) {
                throw utilities_1.errorUtilities.createError("No user course updated", 400);
            }
            return updatedRecord;
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
