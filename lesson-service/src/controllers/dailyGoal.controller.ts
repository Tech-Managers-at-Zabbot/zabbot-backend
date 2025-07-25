import { Request, Response } from 'express';
import { errorUtilities, responseUtilities } from '../../../shared/utilities';
import { dailyGoalsServices } from '../services';


const getUserDailyGoals = errorUtilities.withControllerErrorHandling(
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

const completeDailyGoalController = errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
        const { userId, goalId } = request.params;
        const updateDailyGoal = await dailyGoalsServices.completionOfDailyGoals(userId, goalId)
        return responseUtilities.responseHandler(
            response,
            updateDailyGoal.message,
            updateDailyGoal.statusCode,
            updateDailyGoal.data);
    }
)

const getUserCompletedGoalsCount = errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
        const { userId } = request.params;
            const updateDailyGoal = await dailyGoalsServices.getAllUserCompletedGoals(userId)
        return responseUtilities.responseHandler(
            response,
            updateDailyGoal.message,
            updateDailyGoal.statusCode,
            updateDailyGoal.data
        );
    })


export default {
    getUserDailyGoals,
    completeDailyGoalController,
    getUserCompletedGoalsCount
}