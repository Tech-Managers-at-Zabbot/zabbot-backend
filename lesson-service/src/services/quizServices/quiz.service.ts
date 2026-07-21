import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { v4 } from "uuid";
import quizRepositories from "../../repositories/quiz.repository";
import { QuizResponses } from "../../responses/responses";
import lessonRepositories from "../../repositories/lesson.repository";

const createQuizService = errorUtilities.withServiceErrorHandling(
  async (quizData) => {
    const payload = {
      ...quizData,
      id: v4(),
      createdAt: new Date(),
    };
    const newQuiz = await quizRepositories.addQuiz(payload);
    return responseUtilities.handleServicesResponse(
      StatusCodes.Created,
      QuizResponses.QUIZ_CREATED_SUCCESSFULLY,
      newQuiz,
    );
  },
);

const getCourseQuizzesService = errorUtilities.withServiceErrorHandling(
  async (courseId: string) => {
    const filter = { courseId };
    const quizzes = await quizRepositories.getQuizzes(filter);
    if (!quizzes) {
      throw errorUtilities.createError(
        QuizResponses.QUIZZES_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }
    const attributes = ["id", "title", "description"];
    const allQuizzes = await Promise.all(
      quizzes.map(async (quiz: Record<string, any>) => {
        const lessonDetails = await lessonRepositories.getLesson(
          quiz?.lessonId,
          attributes,
        );
        return {
          ...quiz,
          lessonDetails,
        };
      }),
    );
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      QuizResponses.SUCCESSFUL_PROCESS,
      allQuizzes,
    );
  },
);

const updateQuizService = errorUtilities.withServiceErrorHandling(
  async (quizId: string, quizData: Record<string, any>) => {
    const existingQuiz = await quizRepositories.getQuiz(quizId);
    if (!existingQuiz) {
      throw errorUtilities.createError(
        QuizResponses.QUIZ_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }

    const payload = {
      ...quizData,
      updatedAt: new Date(),
    };

    const updatedQuiz = await quizRepositories.updateQuiz(quizId, payload);
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      QuizResponses.QUIZ_UPDATED_SUCCESSFULLY,
      updatedQuiz,
    );
  },
);

const deleteQuizService = errorUtilities.withServiceErrorHandling(
  async (quizId: string) => {
    const existingQuiz = await quizRepositories.getQuiz(quizId);
    if (!existingQuiz) {
      throw errorUtilities.createError(
        QuizResponses.QUIZ_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }

    await quizRepositories.deleteQuiz(quizId);
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      QuizResponses.QUIZ_DELETED_SUCCESSFULLY,
      null,
    );
  },
);

export default {
  createQuizService,
  getCourseQuizzesService,
  updateQuizService,
  deleteQuizService,
};
