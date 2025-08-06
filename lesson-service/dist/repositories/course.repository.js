"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const course_1 = __importDefault(require("../entities/course"));
// import LanguageContents from "../entities/language-content";
const courseRepositories = {
    getCourses: async (isActive = true, languageId) => {
        try {
            const where = {
                isActive,
                languageId
            };
            const courses = await course_1.default.findAll({ where: where });
            return courses;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching courses: ${error.message}`, 500);
        }
    },
    getCourse: async (id) => {
        try {
            const course = await course_1.default.findByPk(id);
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
                raw: true
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
    updateCourse: async (courseData, transaction) => {
        try {
            // Update the course
            await courseData.update(courseData, { transaction });
            return courseData;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Updating course: ${error.message}`, 500);
        }
    },
    deleteCourse: async (id) => {
        try {
            await course_1.default.destroy({ where: { id } });
            return { message: "Course deleted successfully" };
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Deleting course: ${error.message}`, 500);
        }
    }
};
exports.default = courseRepositories;
