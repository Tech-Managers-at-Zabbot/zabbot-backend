"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const lesson_1 = __importDefault(require("../../../shared/entities/lesson-service-entities/lesson/lesson"));
const lessonRepositories = {
    getLessons: async (filter) => {
        try {
            const where = {};
            if (typeof filter?.courseId === "string") {
                where.courseId = filter.courseId;
            }
            const lessons = await lesson_1.default.findAll({
                where,
                raw: true,
                order: [["orderNumber", "ASC"]],
            });
            return lessons;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching lessons: ${error.message}`, 500);
        }
    },
    getLessonsOnly: async (courseId, transaction) => {
        try {
            const lessons = await lesson_1.default.findAll({
                where: { courseId },
                order: [["orderNumber", "ASC"]],
                raw: true,
                transaction,
            });
            return lessons;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching lessons: ${error.message}`, 500);
        }
    },
    deleteLessonsByCourseId: async (courseId, transaction) => {
        try {
            await lesson_1.default.destroy({ where: { courseId }, transaction });
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error deleting lessons: ${error.message}`, 500);
        }
    },
    deleteLesson: async (id, transaction) => {
        try {
            await lesson_1.default.destroy({ where: { id }, transaction });
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error deleting lesson: ${error.message}`, 500);
        }
    },
    getLanguageLessons: async (languageId) => {
        try {
            const lessons = await lesson_1.default.findAll({
                where: { languageId },
                order: [["orderNumber", "ASC"]],
                raw: true,
            });
            return lessons;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching lessons: ${error.message}`, 500);
        }
    },
    getLesson: async (id, attributes) => {
        try {
            const lesson = await lesson_1.default.findOne({
                where: { id },
                attributes: attributes ? attributes : undefined,
                raw: true,
            });
            return lesson;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching lesson: ${error.message}`, 500);
        }
    },
    addLesson: async (lessonData, transaction) => {
        try {
            // Create a new lesson
            const newLesson = await lesson_1.default.create(lessonData, { transaction });
            return newLesson;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error creating a new lesson: ${error.message}`, 500);
        }
    },
    updateLesson: async (lessonData, transaction) => {
        try {
            // Update the language
            const updatedLesson = await lessonData.update(lessonData, {
                transaction,
            });
            return updatedLesson;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Updating lesson: ${error.message}`, 500);
        }
    },
    newUpdateLesson: async (lessonId, lessonData, transaction) => {
        try {
            const [updatedCount, updatedLessons] = await lesson_1.default.update(lessonData, {
                where: { id: lessonId },
                returning: true,
                transaction,
            });
            if (updatedCount === 0) {
                throw utilities_1.errorUtilities.createError(`Lesson not found or no changes applied`, 400);
            }
            return updatedLessons[0];
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error updating lesson: ${error.message}`, 500);
        }
    },
};
exports.default = lessonRepositories;
