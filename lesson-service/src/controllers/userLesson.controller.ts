import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import userLessonService from "../services/lessonServices/user-lesson.service";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";

export const getUserLessonsController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;
      const userLessons = await userLessonService.getUserLessons(
        userId,
        request.query,
      );

      return responseUtilities.responseHandler(
        response,
        userLessons.message,
        userLessons.statusCode,
        userLessons.data,
      );
    },
  );

export const getUserLessonController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;
      const { lessonId } = request.params;
      const userLesson = await userLessonService.getUserLesson(
        userId,
        lessonId,
      );

      return responseUtilities.responseHandler(
        response,
        userLesson.message,
        userLesson.statusCode,
        userLesson.data,
      );
    },
  );

export const addUserLessonController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;
      const userLesson = await userLessonService.addUserLesson(
        userId,
        request.body,
      );

      return responseUtilities.responseHandler(
        response,
        userLesson.message,
        userLesson.statusCode,
        userLesson.data,
      );
    },
  );

export const updateUserLessonController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;
      const { lessonId } = request.params;
      const userLesson = await userLessonService.updateUserLesson(
        userId,
        lessonId,
        request.body,
      );

      return responseUtilities.responseHandler(
        response,
        userLesson.message,
        userLesson.statusCode,
        userLesson.data,
      );
    },
  );

export const deleteUserLessonController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;
      const { lessonId } = request.params;
      const userLesson = await userLessonService.deleteUserLesson(
        userId,
        lessonId,
      );

      return responseUtilities.responseHandler(
        response,
        userLesson.message,
        userLesson.statusCode,
        userLesson.data,
      );
    },
  );
