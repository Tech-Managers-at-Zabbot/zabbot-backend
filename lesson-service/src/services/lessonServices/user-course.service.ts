import courseRepositories from "../../repositories/course.repository";
import userCourseRepositories from "../../repositories/user-course.repository";
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { CourseResponses } from "../../responses/responses";

const getUserCourses = errorUtilities.withServiceErrorHandling (
  async (userId: string, languageId:string, courseId:string) => {
    const payload = { languageId, userId, courseId };
    const userCourses = await userCourseRepositories.getUserCourses(payload);
    return userCourses;
  }
);

const getUserCourse = errorUtilities.withServiceErrorHandling (
  async (id: string) => {
    const userCourse = await userCourseRepositories.getUserCourse(id);
    if (!userCourse) {
        throw errorUtilities.createError(CourseResponses.USER_COURSE_NOT_FOUND, StatusCodes.NotFound);
    }
     return responseUtilities.handleServicesResponse(
          StatusCodes.OK,
          CourseResponses.PROCESS_SUCCESSFUL,
          userCourse
        );
  }
);

const addUserCourse = errorUtilities.withServiceErrorHandling (
  async (userCourseData: any) => {
    const existingUserCourse = await userCourseRepositories.getUserCourses({
      userId: userCourseData.userId,
      courseId: userCourseData.courseId,
      languageId: userCourseData.languageId
    });

    if (existingUserCourse.length > 0) {
        throw errorUtilities.createError(`User already enrolled in this course`, 400);
    }

    const newUserCourse = await userCourseRepositories.addUserCourse(userCourseData);
    return newUserCourse;
  }
);

const updateUserCourse = errorUtilities.withServiceErrorHandling (
  async (id: string, userCourseData: any) => {
    const userCourse = await userCourseRepositories.getUserCourse(id);
    if (!userCourse) {
        throw errorUtilities.createError(`User course not found`, 404);
    }

    // Update the user course with new data
    Object.assign(userCourse, userCourseData);
    const updatedUserCourse = await userCourseRepositories.updateUserCourse(userCourse);
    return updatedUserCourse;
  }
);

const deleteUserCourse = errorUtilities.withServiceErrorHandling (
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
  deleteUserCourse
};