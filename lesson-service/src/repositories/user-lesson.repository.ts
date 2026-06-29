import { Transaction } from "sequelize";
import UserLessons from "../../../shared/entities/lesson-service-entities/userLesson/user-lesson";
import { UserLessonAttributes } from "../../../shared/databaseTypes/lesson-service-types";
import { errorUtilities } from "../../../shared/utilities";

type UserLessonFilter = {
  userId: string;
  lessonId?: string;
  courseId?: string;
  languageId?: string;
  isCompleted?: boolean;
};

const userLessonRepositories = {
  getUserLessons: async (filter: UserLessonFilter, projection?: string[]) => {
    try {
      const where: any = {
        userId: filter.userId,
      };

      if (filter.lessonId) where.lessonId = filter.lessonId;
      if (filter.courseId) where.courseId = filter.courseId;
      if (filter.languageId) where.languageId = filter.languageId;
      if (typeof filter.isCompleted === "boolean") {
        where.isCompleted = filter.isCompleted;
      }

      const userLessons = await UserLessons.findAll({
        where,
        attributes: projection,
        order: [["lastAccessed", "DESC"]],
        raw: true,
      });

      return userLessons;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching user lessons: ${error.message}`,
        500,
      );
    }
  },

  getUserLesson: async (
    filter: Pick<UserLessonFilter, "userId" | "lessonId">,
    projection?: string[],
  ) => {
    try {
      const userLesson = await UserLessons.findOne({
        where: {
          userId: filter.userId,
          lessonId: filter.lessonId,
        },
        attributes: projection,
        raw: true,
      });

      return userLesson;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching user lesson: ${error.message}`,
        500,
      );
    }
  },

  addUserLesson: async (
    userLessonData: UserLessonAttributes,
    transaction?: Transaction,
  ) => {
    try {
      const newUserLesson = await UserLessons.create(userLessonData, {
        transaction,
      });

      return newUserLesson;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error adding user lesson: ${error.message}`,
        500,
      );
    }
  },

  updateUserLesson: async (
    userId: string,
    lessonId: string,
    userLessonData: Partial<UserLessonAttributes>,
  ) => {
    try {
      const [rowsUpdated, [updatedRecord]] = await UserLessons.update(
        userLessonData,
        {
          where: {
            userId,
            lessonId,
          },
          returning: true,
        },
      );

      if (rowsUpdated === 0) {
        throw errorUtilities.createError("No user lesson updated", 400);
      }

      return updatedRecord;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error updating user lesson: ${error.message}`,
        500,
      );
    }
  },
};

export default userLessonRepositories;
