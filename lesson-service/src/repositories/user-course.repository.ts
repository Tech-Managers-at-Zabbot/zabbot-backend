import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import UserCourses from "../../../shared/entities/lesson-service-entities/userCourse/user-course";


const userCourseRepositories = {
  getUserCourses: async (filter: { languageId: string; userId: string, courseId?: string }, projection?: string[]) => {
    try {
      const where: any = {
        languageId: filter?.languageId, userId: filter?.userId, isActive:true
      };

      if (filter?.courseId) {
        where.courseId = filter.courseId;
      }

      const userCourses = await UserCourses.findAll({
        where,
        attributes: projection,
        order: [['lastAccessed', 'DESC']],
        raw: true
      });

      return userCourses;
    } catch (error: any) {
      throw errorUtilities.createError(`Error Fetching user courses: ${error.message}`, 500);
    }
  },

  getUserCourse: async (id: string) => {
    try {
      const userCourse = await UserCourses.findByPk(id);

      return userCourse;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Fetching user course: ${error.message}`, 500);
    }
  },

  addUserCourse: async (userCourseData: any, transaction?: Transaction) => {
    try {
      // Create a new user course
      const newUserCourse = await UserCourses.create(userCourseData, { transaction });

      return newUserCourse;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Adding user course: ${error.message}`, 500);
    }
  },

  updateUserCourse: async (userCourseData: any, transaction?: Transaction) => {
    try {
      // Update the user course
      await userCourseData.update(userCourseData, { transaction });

      return userCourseData;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Updating user course: ${error.message}`, 500);
    }
  },

  deleteUserCourse: async (id: string) => {
    try {
      const userCourse = await UserCourses.findByPk(id);
      if (!userCourse) {
        throw errorUtilities.createError(`User course not found`, 404);
      }

      await userCourse.destroy();

      return { message: "User course deleted successfully" };
    } catch (error: any) {
      throw errorUtilities.createError(`Error Deleting user course: ${error.message}`, 500);
    }
  },
}

export default userCourseRepositories;