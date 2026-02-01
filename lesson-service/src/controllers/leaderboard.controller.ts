import { Request, Response } from "express";
import courseService from "../services/lessonServices/course.service";
import userCourseService from "../services/lessonServices/user-course.service";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";
import { JwtPayload } from "jsonwebtoken";
import { leaderboardService } from "../services";

const updateUserLeaderboardController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;
      const { scoreToAdd, quizCompleted, quizCorrect, dailyWordsListened } =
        request.body;

      const params = {
        userId,
        scoreToAdd,
        quizCompleted,
        quizCorrect,
        dailyWordsListened,
      };

      const userLeaderboardUpdate =
        await leaderboardService.updateUserLeaderBoardScoresService(params);
      return responseUtilities.responseHandler(
        response,
        userLeaderboardUpdate.message,
        userLeaderboardUpdate.statusCode,
        userLeaderboardUpdate.data,
      );
    },
  );

const getUserLeaderboardPositionController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { userId } = request.user;

      const userLeaderboardData =
        await leaderboardService.getUserLeaderboardPositionService(userId);
      return responseUtilities.responseHandler(
        response,
        userLeaderboardData.message,
        userLeaderboardData.statusCode,
        userLeaderboardData.data,
      );
    },
  );

const getAllLeaderboardDataController =
  errorUtilities.withControllerErrorHandling(
    async (request: JwtPayload, response: Response) => {
      const { period, limit } = request.query;

      const getAllLeaderboardData =
        await leaderboardService.getAllLeaderboardDataService(period, limit);
      return responseUtilities.responseHandler(
        response,
        getAllLeaderboardData.message,
        getAllLeaderboardData.statusCode,
        getAllLeaderboardData.data,
      );
    },
  );

export default {
  updateUserLeaderboardController,
  getUserLeaderboardPositionController,
  getAllLeaderboardDataController,
};
