"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../../shared/utilities");
const uuid_1 = require("uuid");
const statusCodes_responses_1 = require("../../../../shared/statusCodes/statusCodes.responses");
const responses_1 = require("../../responses/responses");
const axiosCalls_1 = require("../../utilities/axiosCalls");
const userDailyGoals_repository_1 = __importDefault(require("../../repositories/userDailyGoals.repository"));
const getDailyGoalService = utilities_1.errorUtilities.withServiceErrorHandling(async (userId, languageId) => {
    const userData = await (0, axiosCalls_1.fetchSingleUser)(userId, ["id", "email", "timeZone"]);
    const user = userData.data;
    const userTimezone = user.timeZone || 'UTC';
    const now = new Date();
    const userDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: userTimezone
    }).format(now);
    let goal = await userDailyGoals_repository_1.default.getOne({ userId: userId, date: userDate });
    if (!goal) {
        const goalData = {
            id: (0, uuid_1.v4)(),
            userId,
            languageId,
            isCompleted: false,
            percentageCompletion: 0,
            date: userDate
        };
        goal = await userDailyGoals_repository_1.default.create(goalData);
    }
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.Created, responses_1.DailyGoalResponses.SUCCESSFUL_FETCH, goal);
});
const completionOfDailyGoals = utilities_1.errorUtilities.withServiceErrorHandling(async (userId, goalId) => {
    const existingGoal = await userDailyGoals_repository_1.default.getOne({ userId, id: goalId });
    if (existingGoal && existingGoal.isCompleted) {
        return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.DailyGoalResponses.GOAL_ALREADY_COMPLETED, existingGoal);
    }
    const goalUpdate = await userDailyGoals_repository_1.default.updateOne({
        userId, id: goalId
    }, {
        isCompleted: true,
        percentageCompletion: 100
    });
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.DailyGoalResponses.SUCCESSFUL_PROCESS, goalUpdate);
});
const getAllUserCompletedGoals = utilities_1.errorUtilities.withServiceErrorHandling(async (userId) => {
    const userGoalsCount = await userDailyGoals_repository_1.default.getCount({ userId, isCompleted: true });
    return utilities_1.responseUtilities.handleServicesResponse(statusCodes_responses_1.StatusCodes.OK, responses_1.DailyGoalResponses.SUCCESSFUL_FETCH, userGoalsCount);
});
exports.default = {
    getDailyGoalService,
    completionOfDailyGoals,
    getAllUserCompletedGoals
};
