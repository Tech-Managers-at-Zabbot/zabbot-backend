"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const services_1 = require("../services");
const getUserDailyGoals = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { userId, languageId } = request.params;
    const dailyGoals = await services_1.dailyGoalsServices.getDailyGoalService(userId, languageId);
    return utilities_1.responseUtilities.responseHandler(response, dailyGoals.message, dailyGoals.statusCode, dailyGoals.data);
});
const completeDailyGoalController = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { userId, goalId } = request.params;
    const updateDailyGoal = await services_1.dailyGoalsServices.completionOfDailyGoals(userId, goalId);
    return utilities_1.responseUtilities.responseHandler(response, updateDailyGoal.message, updateDailyGoal.statusCode, updateDailyGoal.data);
});
const getUserCompletedGoalsCount = utilities_1.errorUtilities.withControllerErrorHandling(async (request, response) => {
    const { userId } = request.params;
    const updateDailyGoal = await services_1.dailyGoalsServices.getAllUserCompletedGoals(userId);
    return utilities_1.responseUtilities.responseHandler(response, updateDailyGoal.message, updateDailyGoal.statusCode, updateDailyGoal.data);
});
exports.default = {
    getUserDailyGoals,
    completeDailyGoalController,
    getUserCompletedGoalsCount
};
