"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const course_1 = __importDefault(require("../../../shared/entities/lesson-service-entities/course/course"));
// import LanguageContents from "../entities/language-content";
const courseRepositories = {
    getCourses: async ({ isActive, languageId, isAdmin, }) => {
        try {
            const where = { languageId };
            const isAdminFlag = String(isAdmin).toLowerCase() === "true";
            const hasValidIsActive = typeof isActive === "boolean" ||
                (typeof isActive === "string" &&
                    (isActive.toLowerCase() === "true" || isActive.toLowerCase() === "false"));
            if (!isAdminFlag && hasValidIsActive) {
                where.isActive = String(isActive).toLowerCase() === "true";
            }
            const courses = await course_1.default.findAll({ where });
            return courses;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching courses: ${error.message}`, 500);
        }
    },
    getCourse: async (id, projections) => {
        try {
            const course = await course_1.default.findOne({
                where: {
                    id,
                },
                raw: true,
                attributes: projections ? projections : undefined,
            });
            return course;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching course: ${error.message}`, 500);
        }
    },
    getCourseWithLanguageId: async (languageId) => {
        try {
            const course = await course_1.default.findOne({
                where: { languageId },
                raw: true,
            });
            return course;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching course: ${error.message}`, 500);
        }
    },
    getCourseByTitle: async (title) => {
        try {
            const course = await course_1.default.findOne({ where: { title } });
            return course;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching course by title: ${error.message}`, 500);
        }
    },
    addCourse: async (courseData, transaction) => {
        try {
            // Create a new course
            const newCourse = await course_1.default.create(courseData, { transaction });
            return newCourse;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Adding course: ${error.message}`, 500);
        }
    },
    updateCourse: async (id, courseData, transaction) => {
        try {
            if (!id) {
                throw utilities_1.errorUtilities.createError("Course id is required", 400);
            }
            const [rowsUpdated, [updatedRecord]] = await course_1.default.update(courseData, {
                where: {
                    id,
                },
                returning: true,
            });
            if (rowsUpdated === 0) {
                throw utilities_1.errorUtilities.createError("No course updated", 400);
            }
            return updatedRecord;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Updating course: ${error.message}`, 500);
        }
    },
    deleteCourse: async (id, transaction) => {
        try {
            await course_1.default.destroy({ where: { id }, transaction });
            return { message: "Course deleted successfully" };
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Deleting course: ${error.message}`, 500);
        }
    },
};
exports.default = courseRepositories;
