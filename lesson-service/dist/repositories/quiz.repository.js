"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const quiz_1 = __importDefault(require("../../../shared/entities/lesson-service-entities/quiz/quiz"));
// import LanguageContents from "../entities/language-content";
const quizRepositories = {
    getQuizzes: async (filter, isActive = true) => {
        try {
            const where = {
                ...filter,
                // isActive,
            };
            const quizzes = await quiz_1.default.findAll({
                where: where,
                raw: true,
                order: [["createdAt", "ASC"]],
            });
            return quizzes;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error fetching quizzes: ${error.message}`, 500);
        }
    },
    getQuiz: async (id) => {
        try {
            const quiz = await quiz_1.default.findByPk(id);
            return quiz;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error fetching Quiz: ${error.message}`, 500);
        }
    },
    addQuiz: async (quizData, transaction) => {
        try {
            const newQuiz = await quiz_1.default.create(quizData, { transaction });
            return newQuiz;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error adding quiz: ${error.message}`, 500);
        }
    },
    updateQuiz: async (id, quizData, transaction) => {
        try {
            const [updatedCount, updatedQuizzes] = await quiz_1.default.update(quizData, {
                where: { id },
                returning: true,
                transaction,
            });
            if (updatedCount === 0) {
                throw utilities_1.errorUtilities.createError("Quiz not found or no changes applied", 404);
            }
            return updatedQuizzes[0];
        }
        catch (error) {
            if (error?.statusCode) {
                throw error;
            }
            throw utilities_1.errorUtilities.createError(`Error updating quiz: ${error.message}`, 500);
        }
    },
    deleteQuiz: async (id, transaction) => {
        try {
            await quiz_1.default.destroy({ where: { id }, transaction });
            return { message: "Quiz deleted successfully" };
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error deleting quiz: ${error.message}`, 500);
        }
    },
    deleteQuizzesByCourseId: async (courseId, transaction) => {
        try {
            await quiz_1.default.destroy({ where: { courseId }, transaction });
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error deleting quizzes: ${error.message}`, 500);
        }
    },
    deleteQuizzesByLessonId: async (lessonId, transaction) => {
        try {
            await quiz_1.default.destroy({ where: { lessonId }, transaction });
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error deleting quizzes: ${error.message}`, 500);
        }
    },
};
exports.default = quizRepositories;
