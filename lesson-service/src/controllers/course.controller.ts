import { Request, Response } from "express";
import courseService from "../services/lessonServices/course.service";
import userCourseService from "../services/lessonServices/user-course.service";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";
import { JwtPayload } from "jsonwebtoken";

// Controller to get all courses
export const getCoursesController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { languageId } = req.params;
    const { isActive } = req.query;

    const courses = await courseService.getCoursesForLanguage(
      languageId,
      isActive
    );
    return responseUtilities.responseHandler(
      res,
      courses.message,
      courses.statusCode,
      courses.data
    );
  }
);

// Controller to get a single course
export const getCourseController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    let { projections }: any = req.query;
    const newProjections = JSON.parse(projections);
    if (!Array.isArray(newProjections)) {
      projections = projections ? [projections] : undefined;
    }
    const course = await courseService.getCourse(courseId, newProjections);
    return responseUtilities.responseHandler(
      res,
      course.message,
      course.statusCode,
      course.data
    );
  }
);

// Controller to get a course by title
export const getCourseByTitleController =
  errorUtilities.withControllerErrorHandling(
    async (req: Request, res: Response) => {
      const { title } = req.params;
      const course = await courseService.getCourseByTitle(title);
      return responseUtilities.responseHandler(
        res,
        course.message,
        course.statusCode,
        course.data
      );
    }
  );

// Controller to create a new course
export const addCourseController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const course = await courseService.addCourse(payload);
    return responseUtilities.responseHandler(
      res,
      course.message,
      course.statusCode,
      course.data
    );
  }
);

// Controller to update an existing course
export const updateCourseController =
  errorUtilities.withControllerErrorHandling(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const payload = req.body;
      const course = await courseService.updateCourse(id, payload);
      return responseUtilities.responseHandler(
        res,
        course.message,
        course.statusCode,
        course.data
      );
    }
  );

// Controller to delete a course
export const deleteCourseController =
  errorUtilities.withControllerErrorHandling(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const course = await courseService.deleteCourse(id);
      return responseUtilities.responseHandler(
        res,
        course.message,
        course.statusCode,
        course.data
      );
    }
  );

// Controller to get all user courses
export const getUserCoursesController =
  errorUtilities.withControllerErrorHandling(
    async (req: Request, res: Response) => {
      const userCourses = await userCourseService.getUserCourses(req.query);
      return responseUtilities.responseHandler(
        res,
        userCourses.message,
        userCourses.statusCode,
        userCourses.data
      );
    }
  );

// Controller to get user course
export const getUserCourseController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId }: string | any = request?.user;
      const { languageId, courseId } = request.params;
      const { lastLessonId } = request.query
      const userCourse = await userCourseService.getUserCourse(
        languageId,
        userId,
        courseId,
        lastLessonId
      );
      return responseUtilities.responseHandler(
        response,
        userCourse.message,
        userCourse.statusCode,
        userCourse.data
      );
    }
  );

// Controller to add user to course
export const addUserCourseController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { languageId, courseId } = request.params;
      const { userId } = request.user;
      const userCourseData = {
        ...request.body,
        userId,
        languageId,
        courseId,
        lastAccessed: new Date(),
        isCompleted: false,
        isActive: true,
      };
      const addUserCourse = await userCourseService.addUserCourse(
        userCourseData
      );

      return responseUtilities.responseHandler(
        response,
        addUserCourse.message,
        addUserCourse.statusCode,
        addUserCourse.data
      );
    }
  );

// Controller to update user course
export const updateUserCourseController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { courseId } = request.params;
      const { userId } = request.user;
      const lessonId = request.body.lastLessonId
      const updateUserCourse = await userCourseService.updateUserCourse(
        courseId,
        userId,
        request.body,
        lessonId
      );
      return responseUtilities.responseHandler(
        response,
        updateUserCourse.message,
        updateUserCourse.statusCode,
        updateUserCourse.data
      );
    }
  );

export const getUserCompletedCoursesController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;
      const { languageId } = request.params;
      const { countOnly } = request.query;

      const userCompletedCourses =
        await userCourseService.getUserCompletedCoursesService(
          userId,
          languageId,
          countOnly
        );

      return responseUtilities.responseHandler(
        response,
        userCompletedCourses.message,
        userCompletedCourses.statusCode,
        userCompletedCourses.data
      );
    }
  );

export const getCourseWithLessonsController =
  errorUtilities.withControllerErrorHandling(
    async (req: JwtPayload, res: Response) => {
      const { languageId } = req.params;
      const courseWithLessons = await courseService.getCourseWithLessonsService(
        languageId
      );
      return responseUtilities.responseHandler(
        res,
        courseWithLessons.message,
        courseWithLessons.statusCode,
        courseWithLessons.data
      );
    }
  );

export const removeUserCourseController =
  errorUtilities.withControllerErrorHandling(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const removeUserFromCourse = await userCourseService.deleteUserCourse(id);

      return responseUtilities.responseHandler(
        res,
        removeUserFromCourse.message,
        removeUserFromCourse.statusCode,
        removeUserFromCourse.data
      );
    }
  );

export const createCourseWithLessonsController =
  errorUtilities.withControllerErrorHandling(
    async (req: Request, res: Response) => {
      const { courseData, lessons } = req.body;
      const { languageId } = req.params;
      const course = await courseService.createCourseWithLessons(
        courseData,
        lessons,
        languageId
      );
      return responseUtilities.responseHandler(
        res,
        course.message,
        course.statusCode,
        course.data
      );
    }
  );
