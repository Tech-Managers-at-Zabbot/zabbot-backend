import { Request, Response } from 'express';
import { errorUtilities, responseUtilities } from '../../../shared/utilities';
import { dailyGoalsServices } from '../services';


export const getUserDailyGoals = errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
        const { userId, languageId } = request.params;
        const dailyGoals = await dailyGoalsServices.getDailyGoalService(userId, languageId);
        return responseUtilities.responseHandler(
            response,
            dailyGoals.message,
            dailyGoals.statusCode,
            dailyGoals.data);
    }
);


export default {
    getUserDailyGoals
}