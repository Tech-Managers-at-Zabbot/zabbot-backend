import { Request, Response } from 'express';
import courseService from '../services/lessonServices/course.service';
import userCourseService from '../services/lessonServices/user-course.service';
import { errorUtilities, responseUtilities } from '../../../shared/utilities';
import { JwtPayload } from 'jsonwebtoken'

// Controller to get all courses
export const getCoursesController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {

    const { languageId } = req.params
    const { isActive } = req.query
      // const isActive: boolean | null = req.query.isActive === 'true' ? true
      //   : req.query.isActive === 'false' ? false
      //   : true;
        
      const courses = await courseService.getCoursesForLanguage(isActive, languageId);
      return responseUtilities.responseHandler(res, courses.message, courses.statusCode, courses.data);
  }
);

// Controller to get a single course
export const getCourseController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const course = await courseService.getCourse(id);
    return responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
  }
);

// Controller to get a course by title
export const getCourseByTitleController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { title } = req.params;
    const course = await courseService.getCourseByTitle(title);
    return responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
  }
);

// Controller to create a new course
export const addCourseController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const course = await courseService.addCourse(payload);
    return responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
  }
);

// Controller to update an existing course
export const updateCourseController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const course = await courseService.updateCourse(id, payload);
    return responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
  }
);

// Controller to delete a course
export const deleteCourseController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const course = await courseService.deleteCourse(id);
    return responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
  }
);

// Controller to get all user courses
export const getUserCoursesController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const userCourses = await userCourseService.getUserCourses(req.query);
    return responseUtilities.responseHandler(res, userCourses.message, userCourses.statusCode, userCourses.data);
  }
);

// Controller to get user course
export const getUserCourseController = errorUtilities.withControllerErrorHandling(
  async (req: JwtPayload, res: Response) => {
    const { id }: string | any = req?.user;
    const userCourse = await userCourseService.getUserCourse(id);
    return responseUtilities.responseHandler(res, userCourse.message, userCourse.statusCode, userCourse.data);
  }
);

// Controller to add user to course
export const addUserCourseController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { title } = req.params;
    const addUserCourse = await userCourseService.addUserCourse(title);

    return responseUtilities.responseHandler(res, addUserCourse.message, addUserCourse.statusCode, addUserCourse.data);
  }
);

// Controller to update user course
export const updateUserCourseController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const {id} = req.params;
    const {userCourseData} = req.body;
    const updateUserCourse = await userCourseService.updateUserCourse(id, userCourseData);
    return responseUtilities.responseHandler(res, updateUserCourse.message, updateUserCourse.statusCode, updateUserCourse.data);
  }
);

export const removeUserCourseController = errorUtilities.withControllerErrorHandling(
  async(req: Request, res: Response) => {
    const {id} = req.params;
    const removeUserFromCourse = await userCourseService.deleteUserCourse(id);

    return responseUtilities.responseHandler(res, removeUserFromCourse.message, removeUserFromCourse.statusCode, removeUserFromCourse.data);
  }
);

export const createCourseWithLessonsController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { courseData, lessons } = req.body;
    const { languageId } = req.params;
    const course = await courseService.createCourseWithLessons(courseData, lessons, languageId);
    return responseUtilities.responseHandler(res, course.message, course.statusCode, course.data);
  }
);