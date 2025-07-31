import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import Questions from "../entities/question";
import LessonQuestions from "../entities/lesson-question";
import ContentQuestions from "../entities/content-question";


const questionRepositories = {
  
  getQuestions: async (filter?: { lessonId?: string }) => {
    try {
      const where: any = {}
      if (typeof filter?.lessonId === 'string') {
        where.lessonId = filter.lessonId
      }

      // Pass it straight to Sequelize
      const questions = await Questions.findAll({ where });

      return questions;
    } catch (error: any) {
        throw errorUtilities.createError(`Error Fetching questions: ${error.message}`, 500);
    }
  },

  getQuestion: async (id: string) => {
    try {
        const question = await Questions.findByPk(id);

        return question;
    } catch(error: any) {
        throw errorUtilities.createError(`Error Fetching question: ${error.message}`, 500);
    }
  },

  addQuestion: async (questionData: any, transaction?: Transaction) => {
    try {
      // Create a new question
      const newQuestion = await Questions.create(questionData, { transaction });

      return newQuestion;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Adding question: ${error.message}`, 500);
    }
  },

  updateQuestion: async (id: string, questionData: any) => {
    try {
      // Update the question
      await Questions.update(questionData, { where: { id } })

      return questionData;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Updating question: ${error.message}`, 500);
    }
  },

  deleteQuestion: async (id: string) => {
    try {
      await Questions.destroy({ where: { id } });

      return { message: "Question deleted successfully" };

    } catch (error: any) {
      throw errorUtilities.createError(`Error Deleting question: ${error.message}`, 500);
    }
  },

  getLessonToQuestionMap: async (filter?: { lessonId?: string, questionId?: string }) => {
    try {
      const where: any = {}
      if (typeof filter?.lessonId === 'string')
        where.lessonId = filter.lessonId
      
      if (typeof filter?.questionId === 'string')
        where.questionId = filter.questionId

      const lessonToQuestions = await LessonQuestions.findAll({ where });
      return lessonToQuestions;
    } catch(error: any) {
      throw errorUtilities.createError(`Error finding question mapped to lesson: ${error.message}`, 500);
    }
  },

  mapLessonToQuestion: async (mapData: any, transaction?: Transaction) => {
    try {
      const lessonQuestion = await LessonQuestions.create(mapData, { transaction });
      return lessonQuestion;
    } catch(error: any) {
      throw errorUtilities.createError(`Error mapping lesson to a question: ${error.message}`, 500);
    }
  },

  deleteLessonToQuestionMap: async (id: string) => {
    try {
      await LessonQuestions.destroy({ where: { id } });

      return { message: "Lesson to Question map deleted successfully" };
    } catch(error: any) {
      throw errorUtilities.createError(`Error deleting lesson to question map: ${error.message}`, 500);
    }
  },

  mapContentToQuestion: async (mapData: any, transaction?: Transaction) => {
    try {
      const contentQuestion = await ContentQuestions.create(mapData, { transaction });
      return contentQuestion;
    } catch(error: any) {
      throw errorUtilities.createError(`Error mapping content to a question: ${error.message}`, 500);
    }
  },

  deleteContentToQuestionMap: async (id: string) => {
    try {
      await ContentQuestions.destroy({ where: { id } });

      return { message: "Content to Question map deleted successfully" };
    } catch(error: any) {
      throw errorUtilities.createError(`Error deleting lesson to content map: ${error.message}`, 500);
    }
  }
}

export default questionRepositories;