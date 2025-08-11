import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import { LessonAttributes } from "../data-types/interface";
import Lessons from "../entities/lesson";

const lessonRepositories = {

  getLessons: async (filter?: { courseId: string }) => {
    try {
      const where: any = {};
			if (typeof filter?.courseId === 'string') {
				where.courseId = filter.courseId;
			}

      const lessons = await Lessons.findAll({ where });

      return lessons;

    } catch (error: any) {
        throw errorUtilities.createError(`Error Fetching lessons: ${error.message}`, 500);
    }
  },

  getLessonsOnly: async (courseId: string) => {
    try {
      const lessons = await Lessons.findAll({ where: {courseId }, order: [['orderNumber', 'ASC']], raw:true});

      return lessons;

    } catch (error: any) {
        throw errorUtilities.createError(`Error Fetching lessons: ${error.message}`, 500);
    }
  },


  getLanguageLessons: async (languageId: string) => {
    try {
      const lessons = await Lessons.findAll({ where: {languageId }, order: [['orderNumber', 'ASC']], raw:true});

      return lessons;

    } catch (error: any) {
        throw errorUtilities.createError(`Error Fetching lessons: ${error.message}`, 500);
    }
  },

  getLesson: async (id: string) => {
    try {
      const lesson = await Lessons.findByPk(id);

      return lesson;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Fetching lesson: ${error.message}`, 500);
    }
  },

  addLesson: async (lessonData: any, transaction?: Transaction) => {
    try {
      // Create a new lesson
      const newLesson = await Lessons.create(lessonData, { transaction });

      return newLesson;

    } catch (error: any) {
      throw errorUtilities.createError(`Error creating a new lesson: ${error.message}`, 500);
    }
  },

  updateLesson: async (lessonData: any, transaction?: Transaction) => {
    try {
      // Update the language
      const updatedLesson = await lessonData.update( lessonData, { transaction });

      return updatedLesson;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Updating lesson: ${error.message}`, 500);
    }
  }
}

export default lessonRepositories;