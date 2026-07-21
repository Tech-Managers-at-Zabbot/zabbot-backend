"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const quiz_service_1 = __importDefault(require("../services/quizServices/quiz.service"));
const addQuizController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const payload = request.body;
    const course = await quiz_service_1.default.createQuizService(payload);
    return utilities_1.responseUtilities.responseHandler(response, course.message, course.statusCode, course.data);
});
const getCourseQuizzesController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { courseId } = request.params;
    const quizzes = await quiz_service_1.default.getCourseQuizzesService(courseId);
    return utilities_1.responseUtilities.responseHandler(response, quizzes.message, quizzes.statusCode, quizzes.data);
});
const updateQuizController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { id } = request.params;
    const payload = request.body;
    const quiz = await quiz_service_1.default.updateQuizService(id, payload);
    return utilities_1.responseUtilities.responseHandler(response, quiz.message, quiz.statusCode, quiz.data);
});
const deleteQuizController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { id } = request.params;
    const quiz = await quiz_service_1.default.deleteQuizService(id);
    return utilities_1.responseUtilities.responseHandler(response, quiz.message, quiz.statusCode, quiz.data);
});
exports.default = {
    addQuizController,
    getCourseQuizzesController,
    updateQuizController,
    deleteQuizController,
};
