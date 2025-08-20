"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../../shared/utilities");
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const uuid_1 = require("uuid");
const quiz_repository_1 = __importDefault(require("../../repositories/quiz.repository"));
const responses_1 = require("../../responses/responses");
const lesson_repository_1 = __importDefault(require("../../repositories/lesson.repository"));
const createQuizService = utilities_1.errorUtilities.withServiceErrorHandling(async (quizData) => {
    const payload = {
        ...quizData,
        id: (0, uuid_1.v4)(),
        createdAt: new Date(),
    };
    const newQuiz = await quiz_repository_1.default.addQuiz(payload);
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, responses_1.QuizResponses.QUIZ_CREATED_SUCCESSFULLY, newQuiz);
});
const getCourseQuizzesService = utilities_1.errorUtilities.withServiceErrorHandling(async (courseId) => {
    const filter = { courseId };
    const quizzes = await quiz_repository_1.default.getQuizzes(filter);
    if (!quizzes) {
        throw utilities_1.errorUtilities.createError(responses_1.QuizResponses.QUIZZES_NOT_FOUND, statusCodes_responses_1.StatusCodes.NotFound);
    }
    const attributes = ["id", "title", "description"];
    const allQuizzes = await Promise.all(quizzes.map(async (quiz) => {
        const lessonDetails = await lesson_repository_1.default.getLesson(quiz?.lessonId, attributes);
        return {
            ...quiz,
            lessonDetails
        };
    }));
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.QuizResponses.SUCCESSFUL_PROCESS, allQuizzes);
});
exports.default = {
    createQuizService,
    getCourseQuizzesService
};
