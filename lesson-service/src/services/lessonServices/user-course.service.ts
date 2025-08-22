import courseRepositories from "../../repositories/course.repository";
import userCourseRepositories from "../../repositories/user-course.repository";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { CourseResponses } from "../../responses/responses";
import { v4 } from "uuid";
import lessonRepositories from "../../repositories/lesson.repository";
// import courseService from "./course.service";

const getUserCourses = errorUtilities.withServiceErrorHandling(
  async (userId: string, languageId: string, courseId: string) => {
    const payload = { languageId, userId, courseId };
    const userCourses = await userCourseRepositories.getUserCourses(payload);
    return userCourses;
  }
);

const getUserCourse = errorUtilities.withServiceErrorHandling(
  async (languageId: string, userId: string, courseId: string, lastLessonId:string) => {
    const userCourse = await userCourseRepositories.getUserCourse({
      languageId,
      userId,
      courseId,
      lastLessonId
    });
    if (!userCourse) {
      throw errorUtilities.createError(
        CourseResponses.USER_COURSE_NOT_FOUND,
        StatusCodes.NotFound
      );
    }
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      userCourse
    );
  }
);

// const getUserCourseAndLessons = errorUtilities.withServiceErrorHandling (
//   async (courseId: string, userId:string) => {
//     const userCourse = await userCourseRepositories.getUserCourseWithUserId(courseId, userId);
//     if (!userCourse) {
//         throw errorUtilities.createError(CourseResponses.USER_COURSE_NOT_FOUND, StatusCodes.NotFound);
//     }
//     const course = await courseService.getCourseWithLessons(userCourse.courseId);
//      return responseUtilities.handleServicesResponse(
//           StatusCodes.OK,
//           CourseResponses.PROCESS_SUCCESSFUL,
//           course.data
//         );
//   }
// );

const addUserCourse = errorUtilities.withServiceErrorHandling(
  async (userCourseData: any) => {
    const existingUserCourse = await userCourseRepositories.getUserCourse({
      userId: userCourseData.userId,
      courseId: userCourseData.courseId,
      languageId: userCourseData.languageId,
      lastLessonId: userCourseData.lastLessonId,
    });

    if (existingUserCourse) {
      throw errorUtilities.createError(
        CourseResponses.USER_ENROLLED_FOR_COURSE,
        StatusCodes.BadRequest
      );
    }

    const newUserCourse = await userCourseRepositories.addUserCourse({
      id: v4(),
      ...userCourseData,
    });
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      newUserCourse
    );
  }
);

const getUserCompletedCoursesService = errorUtilities.withServiceErrorHandling(
  async (userId: string, languageId: string, countOnly?: string) => {
    const userCompletedCourses =
      await userCourseRepositories.getCompletedCourses(
        userId,
        languageId,
        countOnly
      );
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      userCompletedCourses
    );
  }
);

const updateUserCourse = errorUtilities.withServiceErrorHandling(
  async (courseId: string | any, userId: string, userCourseData: any, lessonId: string) => {

    const userCourse = await userCourseRepositories.getUserCourse({
      userId: userId,
      courseId: courseId,
      lastLessonId: lessonId
    });

    if (!userCourse) {
      throw errorUtilities.createError(
        CourseResponses.USER_COURSE_NOT_FOUND,
        StatusCodes.NotFound
      );
    }

    const lessonExists = await lessonRepositories.getLesson(lessonId)

    if (!lessonExists) {
      throw errorUtilities.createError(
        CourseResponses.LESSON_NOT_FOUND,
        StatusCodes.NotFound
      );
    }

    if (userCourse.isCompleted && userCourse.progress === 100) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        CourseResponses.PROCESS_SUCCESSFUL,
        userCourse
      );
    }

    Object.assign(userCourse, userCourseData);
    const updatedUserCourse = await userCourseRepositories.updateUserCourse(
      userCourse,
      userCourse.id,
      lessonId
    );

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      updatedUserCourse
    );
  }
);

const deleteUserCourse = errorUtilities.withServiceErrorHandling(
  async (id: string) => {
    await userCourseRepositories.deleteUserCourse(id);

    return { message: "User course deleted successfully" };
  }
);

export default {
  getUserCourses,
  getUserCourse,
  addUserCourse,
  updateUserCourse,
  deleteUserCourse,
  getUserCompletedCoursesService,
  // getUserCourseAndLessons
};
