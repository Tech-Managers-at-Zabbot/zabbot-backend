import { Request, Response } from "express";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";
import quizService from "../services/quizServices/quiz.service";

const addQuizController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const payload = request.body;
    const course = await quizService.createQuizService(payload);
    return responseUtilities.responseHandler(
      response,
      course.message,
      course.statusCode,
      course.data,
    );
  },
);

const getCourseQuizzesController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { courseId } = request.params;
    const quizzes = await quizService.getCourseQuizzesService(courseId);
    return responseUtilities.responseHandler(
      response,
      quizzes.message,
      quizzes.statusCode,
      quizzes.data,
    );
  },
);

const updateQuizController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { id } = request.params;
    const payload = request.body;
    const quiz = await quizService.updateQuizService(id, payload);
    return responseUtilities.responseHandler(
      response,
      quiz.message,
      quiz.statusCode,
      quiz.data,
    );
  },
);

const deleteQuizController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { id } = request.params;
    const quiz = await quizService.deleteQuizService(id);
    return responseUtilities.responseHandler(
      response,
      quiz.message,
      quiz.statusCode,
      quiz.data,
    );
  },
);

export default {
  addQuizController,
  getCourseQuizzesController,
  updateQuizController,
  deleteQuizController,
};
