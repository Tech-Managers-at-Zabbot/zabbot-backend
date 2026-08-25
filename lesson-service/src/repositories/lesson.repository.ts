import { Transaction } from "sequelize";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";
import Lessons from "../../../shared/entities/lesson-service-entities/lesson/lesson";
import { LessonAttributes } from "../../../shared/databaseTypes/lesson-service-types";
import { StatusCodes } from "../../../shared/statusCodes/statusCodes.responses";

const lessonRepositories = {
  getLessons: async (filter?: { courseId?: string; isActive?: boolean }) => {
    try {
      const where: any = {};
      if (typeof filter?.courseId === "string") {
        where.courseId = filter.courseId;
      }
      if (typeof filter?.isActive === "boolean") {
        where.isActive = filter.isActive;
      }

      const lessons = await Lessons.findAll({
        where,
        raw: true,
        order: [["orderNumber", "ASC"]],
      });

      return lessons;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching lessons: ${error.message}`,
        500,
      );
    }
  },

  getLessonsOnly: async (courseId: string, transaction?: Transaction) => {
    try {
      const lessons = await Lessons.findAll({
        where: { courseId },
        order: [["orderNumber", "ASC"]],
        raw: true,
        transaction,
      });

      return lessons;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching lessons: ${error.message}`,
        500,
      );
    }
  },

  deleteLessonsByCourseId: async (
    courseId: string,
    transaction?: Transaction,
  ) => {
    try {
      await Lessons.destroy({ where: { courseId }, transaction });
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error deleting lessons: ${error.message}`,
        500,
      );
    }
  },

  deleteLesson: async (id: string, transaction?: Transaction) => {
    try {
      await Lessons.destroy({ where: { id }, transaction });
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error deleting lesson: ${error.message}`,
        500,
      );
    }
  },

  getLanguageLessons: async (languageId: string) => {
    try {
      const lessons = await Lessons.findAll({
        where: { languageId },
        order: [["orderNumber", "ASC"]],
        raw: true,
      });

      return lessons;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching lessons: ${error.message}`,
        500,
      );
    }
  },

  getLesson: async (id: string, attributes?: string[]) => {
    try {
      const lesson = await Lessons.findOne({
        where: { id },
        attributes: attributes ? attributes : undefined,
        raw: true,
      });

      return lesson;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching lesson: ${error.message}`,
        500,
      );
    }
  },

  addLesson: async (lessonData: any, transaction?: Transaction) => {
    try {
      // Create a new lesson
      const newLesson = await Lessons.create(lessonData, { transaction });

      return newLesson;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error creating a new lesson: ${error.message}`,
        500,
      );
    }
  },

  updateLesson: async (lessonData: any, transaction?: Transaction) => {
    try {
      // Update the language

      const lesson = await Lessons.findByPk(lessonData.id, { transaction });
      if (!lesson) throw new Error("Lesson not found");

      const updatedLesson = await lesson.update(lessonData, { transaction });

      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "",
        updatedLesson,
      );
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Updating lesson: ${error.message}`,
        500,
      );
    }
  },

  newUpdateLesson: async (
    lessonId: string,
    lessonData: Partial<LessonAttributes> | any,
    transaction?: Transaction,
  ) => {
    try {
      const [updatedCount, updatedLessons] = await Lessons.update(lessonData, {
        where: { id: lessonId },
        returning: true,
        transaction,
      });

      if (updatedCount === 0) {
        throw errorUtilities.createError(
          `Lesson not found or no changes applied`,
          400,
        );
      }

      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Lesson image updated successfully",
        updatedLessons[0],
      );
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error updating lessonx: ${error.message}`,
        500,
      );
    }
  },

  toggleLessonStatus: async (id: string, transaction?: Transaction) => {
    try {
      const lesson = await Lessons.findByPk(id, { transaction });
      if (!lesson) {
        throw errorUtilities.createError("Lesson not found", 404);
      }

      const nextStatus =
        lesson.isActive === undefined ? true : !lesson.isActive;
      const [updatedCount, [updatedLesson]] = await Lessons.update(
        { isActive: nextStatus },
        {
          where: { id },
          returning: true,
          transaction,
        },
      );

      if (updatedCount === 0) {
        throw errorUtilities.createError("Lesson status was not updated", 400);
      }

      return updatedLesson;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error toggling lesson status: ${error.message}`,
        500,
      );
    }
  },
};

export default lessonRepositories;
