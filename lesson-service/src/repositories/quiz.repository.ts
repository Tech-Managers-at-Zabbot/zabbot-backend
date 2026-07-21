import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import Quiz from "../../../shared/entities/lesson-service-entities/quiz/quiz";
// import LanguageContents from "../entities/language-content";

const quizRepositories = {
  getQuizzes: async (filter: Record<string, any>, isActive: boolean = true) => {
    try {
      const where: any = {
        ...filter,
        // isActive,
      };
      const quizzes = await Quiz.findAll({
        where: where,
        raw: true,
        order: [["createdAt", "ASC"]],
      });

      return quizzes;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching quizzes: ${error.message}`,
        500,
      );
    }
  },

  getQuiz: async (id: string) => {
    try {
      const quiz = await Quiz.findByPk(id);

      return quiz;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching Quiz: ${error.message}`,
        500,
      );
    }
  },

  addQuiz: async (
    quizData: Record<string, any> | any,
    transaction?: Transaction,
  ) => {
    try {
      const newQuiz = await Quiz.create(quizData, { transaction });

      return newQuiz;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error adding quiz: ${error.message}`,
        500,
      );
    }
  },

  updateQuiz: async (
    id: string,
    quizData: Record<string, any>,
    transaction?: Transaction,
  ) => {
    try {
      const [updatedCount, updatedQuizzes] = await Quiz.update(quizData, {
        where: { id },
        returning: true,
        transaction,
      });

      if (updatedCount === 0) {
        throw errorUtilities.createError(
          "Quiz not found or no changes applied",
          404,
        );
      }

      return updatedQuizzes[0];
    } catch (error: any) {
      if (error?.statusCode) {
        throw error;
      }
      throw errorUtilities.createError(
        `Error updating quiz: ${error.message}`,
        500,
      );
    }
  },

  deleteQuiz: async (id: string, transaction?: Transaction) => {
    try {
      await Quiz.destroy({ where: { id }, transaction });

      return { message: "Quiz deleted successfully" };
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error deleting quiz: ${error.message}`,
        500,
      );
    }
  },

  deleteQuizzesByCourseId: async (
    courseId: string,
    transaction?: Transaction,
  ) => {
    try {
      await Quiz.destroy({ where: { courseId }, transaction });
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error deleting quizzes: ${error.message}`,
        500,
      );
    }
  },

  deleteQuizzesByLessonId: async (
    lessonId: string,
    transaction?: Transaction,
  ) => {
    try {
      await Quiz.destroy({ where: { lessonId }, transaction });
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error deleting quizzes: ${error.message}`,
        500,
      );
    }
  },
};

export default quizRepositories;
