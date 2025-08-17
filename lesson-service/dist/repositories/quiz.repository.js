"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const quiz_1 = __importDefault(require("../entities/quiz"));
// import LanguageContents from "../entities/language-content";
const quizRepositories = {
    getQuizzes: async (filter, isActive = true) => {
        try {
            const where = {
                ...filter,
                // isActive,
            };
            const quizzes = await quiz_1.default.findAll({ where: where, raw: true, order: [['createdAt', 'ASC']] });
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
    updateQuiz: async (quizData, transaction) => {
        try {
            await quizData.update(quizData, { transaction });
            return quizData;
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error updating quiz: ${error.message}`, 500);
        }
    },
    deleteQuiz: async (id) => {
        try {
            await quiz_1.default.destroy({ where: { id } });
            return { message: "Quiz deleted successfully" };
        }
        catch (error) {
            throw utilities_1.errorUtilities.createError(`Error deleting quiz: ${error.message}`, 500);
        }
    }
};
exports.default = quizRepositories;
