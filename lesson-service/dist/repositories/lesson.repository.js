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
            if (typeof filter?.courseId === 'string') {
                where.courseId = filter.courseId;
            }
            const lessons = await lesson_1.default.findAll({ where, raw: true, order: [['orderNumber', 'ASC']] });
            return lessons;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching lessons: ${error.message}`, 500);
        }
    },
    getLessonsOnly: async (courseId) => {
        try {
            const lessons = await lesson_1.default.findAll({ where: { courseId }, order: [['orderNumber', 'ASC']], raw: true });
            return lessons;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Fetching lessons: ${error.message}`, 500);
        }
    },
    getLanguageLessons: async (languageId) => {
        try {
            const lessons = await lesson_1.default.findAll({ where: { languageId }, order: [['orderNumber', 'ASC']], raw: true });
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
                raw: true
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
            const updatedLesson = await lessonData.update(lessonData, { transaction });
            return updatedLesson;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error Updating lesson: ${error.message}`, 500);
        }
    }
};
exports.default = lessonRepositories;
