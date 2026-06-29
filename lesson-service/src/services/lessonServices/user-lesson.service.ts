import { v4 } from "uuid";
import { UserLessonAttributes } from "../../../../shared/databaseTypes/lesson-service-types";
import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { CourseResponses, UserLessonResponses } from "../../responses/responses";
import courseRepositories from "../../repositories/course.repository";
import lessonRepositories from "../../repositories/lesson.repository";
import userLessonRepositories from "../../repositories/user-lesson.repository";

type UserLessonPayload = Partial<UserLessonAttributes> & {
  courseId: string;
  lessonId: string;
  languageId: string;
};

const parseBooleanQuery = (value: unknown) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const validateCourseLesson = async (
  courseId: string,
  lessonId: string,
  languageId?: string,
) => {
  const course = await courseRepositories.getCourse(courseId);

  if (!course) {
    throw errorUtilities.createError(
      CourseResponses.COURSE_NOT_FOUND,
      StatusCodes.NotFound,
    );
  }

  const lesson = await lessonRepositories.getLesson(lessonId);

  if (!lesson) {
    throw errorUtilities.createError(
      CourseResponses.LESSON_NOT_FOUND,
      StatusCodes.NotFound,
    );
  }

  if ((lesson as any).courseId !== courseId) {
    throw errorUtilities.createError(
      UserLessonResponses.LESSON_NOT_IN_COURSE,
      StatusCodes.BadRequest,
    );
  }

  if (languageId && (lesson as any).languageId !== languageId) {
    throw errorUtilities.createError(
      UserLessonResponses.LESSON_NOT_IN_LANGUAGE,
      StatusCodes.BadRequest,
    );
  }
};

const getUserLessons = errorUtilities.withServiceErrorHandling(
  async (userId: string, query: any) => {
    const userLessons = await userLessonRepositories.getUserLessons({
      userId,
      courseId: query.courseId,
      lessonId: query.lessonId,
      languageId: query.languageId,
      isCompleted: parseBooleanQuery(query.isCompleted),
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      UserLessonResponses.PROCESS_SUCCESSFUL,
      userLessons,
    );
  },
);

const getUserLesson = errorUtilities.withServiceErrorHandling(
  async (userId: string, lessonId: string) => {
    const userLesson = await userLessonRepositories.getUserLesson({
      userId,
      lessonId,
    });

    if (!userLesson) {
      throw errorUtilities.createError(
        UserLessonResponses.USER_LESSON_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      UserLessonResponses.PROCESS_SUCCESSFUL,
      userLesson,
    );
  },
);

const addUserLesson = errorUtilities.withServiceErrorHandling(
  async (userId: string, payload: UserLessonPayload) => {
    const { courseId, lessonId, languageId } = payload;

    if (!courseId || !lessonId || !languageId) {
      throw errorUtilities.createError(
        UserLessonResponses.REQUIRED_FIELDS,
        StatusCodes.BadRequest,
      );
    }

    await validateCourseLesson(courseId, lessonId, languageId);

    const existingUserLesson = await userLessonRepositories.getUserLesson({
      userId,
      lessonId,
    });

    if (existingUserLesson) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        UserLessonResponses.FIRST_ATTEMPT_ALREADY_TRACKED,
        existingUserLesson,
      );
    }

    const isCompleted = Boolean(payload.isCompleted);
    const percentageCompletion =
      typeof payload.percentageCompletion === "number"
        ? payload.percentageCompletion
        : isCompleted
          ? 100
          : 0;

    const newUserLesson = await userLessonRepositories.addUserLesson({
      id: v4(),
      userId,
      courseId,
      lessonId,
      languageId,
      percentageCompletion,
      isCompleted,
      score: payload.score,
      startedAt: payload.startedAt || new Date(),
      completedAt: isCompleted ? payload.completedAt || new Date() : undefined,
      lastAccessed: new Date(),
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.Created,
      UserLessonResponses.USER_LESSON_CREATED,
      newUserLesson,
    );
  },
);

const updateUserLesson = errorUtilities.withServiceErrorHandling(
  async (
    userId: string,
    lessonId: string,
    payload: Partial<UserLessonAttributes>,
  ) => {
    const existingUserLesson = await userLessonRepositories.getUserLesson({
      userId,
      lessonId,
    });

    if (!existingUserLesson) {
      throw errorUtilities.createError(
        UserLessonResponses.USER_LESSON_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }

    if ((existingUserLesson as any).isCompleted) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        UserLessonResponses.FIRST_ATTEMPT_ALREADY_TRACKED,
        existingUserLesson,
      );
    }

    const isCompleted = Boolean(payload.isCompleted);
    const updatePayload: Partial<UserLessonAttributes> = {
      lastAccessed: new Date(),
    };

    if (typeof payload.percentageCompletion === "number") {
      updatePayload.percentageCompletion = payload.percentageCompletion;
    }

    if (typeof payload.score === "number") {
      updatePayload.score = payload.score;
    }

    if (typeof payload.isCompleted === "boolean") {
      updatePayload.isCompleted = payload.isCompleted;
      updatePayload.completedAt = isCompleted ? new Date() : undefined;
      if (
        isCompleted &&
        typeof updatePayload.percentageCompletion !== "number"
      ) {
        updatePayload.percentageCompletion = 100;
      }
    }

    const updatedUserLesson = await userLessonRepositories.updateUserLesson(
      userId,
      lessonId,
      updatePayload,
    );

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      UserLessonResponses.USER_LESSON_UPDATED,
      updatedUserLesson,
    );
  },
);

export default {
  getUserLessons,
  getUserLesson,
  addUserLesson,
  updateUserLesson,
};
