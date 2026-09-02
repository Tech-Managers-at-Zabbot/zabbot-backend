import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import streakService from "../../services/userServices/streak.service";

const logStreakController = errorUtilities.withControllerErrorHandling(
  async (request: JwtPayload, response: Response) => {
    const { userId } = request.user;

    const result = await streakService.logStreakService(userId);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data
    );
  }
);

export default { logStreakController };
