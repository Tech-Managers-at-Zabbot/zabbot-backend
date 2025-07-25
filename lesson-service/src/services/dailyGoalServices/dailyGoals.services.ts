import wordForTheDayRepositories from "../../repositories/wordForTheDay.repository";
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import { v4 } from 'uuid';
import languageRepositories from "../../repositories/language.repository";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { DailyGoalResponses, DailyWordResponses, LanguageResponses } from "../../responses/responses";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import axios from 'axios';
import { fetchSingleUser } from "../../utilities/axiosCalls";
import userDailyGoalRepositories from "../../repositories/userDailyGoals.repository";


const getDailyGoalService = errorUtilities.withServiceErrorHandling(
    async (userId: string, languageId: string) => {
        const userData = await fetchSingleUser(userId, ["id", "email", "timeZone"])
        const user = userData.data
        const userTimezone = user.timeZone || 'UTC';

        const now = new Date();
        const userDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: userTimezone
        }).format(now);

        let goal = await userDailyGoalRepositories.getOne({ userId: userId, date: userDate });
        if (!goal) {
            const goalData = {
                id: v4(),
                userId,
                languageId,
                isCompleted: false,
                percentageCompletion: 0,
                date: userDate
            }
            goal = await userDailyGoalRepositories.create(goalData);
        }

        return responseUtilities.handleServicesResponse(
            StatusCodes.Created,
            DailyGoalResponses.SUCCESSFUL_FETCH,
            goal
        );
    })

const completionOfDailyGoals = errorUtilities.withServiceErrorHandling(
    async (userId: string, goalId: string) => {

        const existingGoal = await userDailyGoalRepositories.getOne({ userId, id: goalId });

        if (existingGoal && existingGoal.isCompleted) {
            return responseUtilities.handleServicesResponse(
                StatusCodes.OK,
                DailyGoalResponses.GOAL_ALREADY_COMPLETED,
                existingGoal
            );
        }

        const goalUpdate = await userDailyGoalRepositories.updateOne(
            {
                userId, id: goalId
            },
            {
                isCompleted: true,
                percentageCompletion: 100
            }
        );

        return responseUtilities.handleServicesResponse(
            StatusCodes.OK,
            DailyGoalResponses.SUCCESSFUL_PROCESS,
            goalUpdate
        );
    })

const getAllUserCompletedGoals = errorUtilities.withServiceErrorHandling(
    async (userId: string) => {

        const userGoalsCount = await userDailyGoalRepositories.getCount({ userId, isCompleted: true })

        return responseUtilities.handleServicesResponse(
            StatusCodes.OK,
            DailyGoalResponses.SUCCESSFUL_FETCH,
            userGoalsCount
        );
    })

export default {
    getDailyGoalService,
    completionOfDailyGoals,
    getAllUserCompletedGoals
}