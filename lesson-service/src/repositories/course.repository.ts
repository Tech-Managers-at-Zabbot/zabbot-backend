import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import Courses from "../../../shared/entities/lesson-service-entities/course/course";
// import LanguageContents from "../entities/language-content";

const courseRepositories = {
  getCourses: async ({
    isActive,
    languageId,
    isAdmin,
  }: {
    isActive?: boolean | string;
    languageId: string;
    isAdmin?: boolean | string;
  }) => {
    try {
      const where: any = { languageId };
      const isAdminFlag = String(isAdmin).toLowerCase() === "true";
      const hasValidIsActive =
        typeof isActive === "boolean" ||
        (typeof isActive === "string" &&
          (isActive.toLowerCase() === "true" ||
            isActive.toLowerCase() === "false"));

      if (!isAdminFlag && hasValidIsActive) {
        where.isActive = String(isActive).toLowerCase() === "true";
      }

      const courses = await Courses.findAll({
        where,
        order: [["orderNumber", "ASC"]],
      });

      return courses;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching courses: ${error.message}`,
        500,
      );
    }
  },

  getCourse: async (id: string, projections?: string[]) => {
    try {
      const course = await Courses.findOne({
        where: {
          id,
        },
        raw: true,
        attributes: projections ? projections : undefined,
      });

      return course;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching course: ${error.message}`,
        500,
      );
    }
  },

  getCourseWithLanguageId: async (languageId: string) => {
    try {
      const course = await Courses.findOne({
        where: { languageId },
        raw: true,
      });

      return course;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching course: ${error.message}`,
        500,
      );
    }
  },

  getCourseByTitle: async (title: string) => {
    try {
      const course = await Courses.findOne({ where: { title } });

      return course;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching course by title: ${error.message}`,
        500,
      );
    }
  },

  addCourse: async (courseData: any, transaction?: Transaction) => {
    try {
      // Create a new course
      const newCourse = await Courses.create(courseData, { transaction });

      return newCourse;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Adding course: ${error.message}`,
        500,
      );
    }
  },

  updateCourse: async (
    id: string,
    courseData: any,
    transaction?: Transaction,
  ) => {
    try {
      if (!id) {
        throw errorUtilities.createError("Course id is required", 400);
      }
      const [rowsUpdated, [updatedRecord]] = await Courses.update(courseData, {
        where: {
          id,
        },
        returning: true,
      });

      if (rowsUpdated === 0) {
        throw errorUtilities.createError("No course updated", 400);
      }

      return updatedRecord;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Updating course: ${error.message}`,
        500,
      );
    }
  },

  deleteCourse: async (id: string, transaction?: Transaction) => {
    try {
      await Courses.destroy({ where: { id }, transaction });

      return { message: "Course deleted successfully" };
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Deleting course: ${error.message}`,
        500,
      );
    }
  },
};

export default courseRepositories;
