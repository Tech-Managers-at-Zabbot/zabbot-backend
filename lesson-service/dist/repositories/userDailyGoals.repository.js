"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../../shared/utilities");
const userDailyGoals_1 = __importDefault(require("../entities/userDailyGoals"));
const userDailyGoalRepositories = {
    create: async (data, transaction) => {
        try {
            const newUserGoal = await userDailyGoals_1.default.create(data, { transaction });
            return newUserGoal;
        }
        catch (error) {
            console.log(`Create Daily Goal Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error updating daily goal, please try again`, 500);
        }
    },
    updateOne: async (filter, update, transaction) => {
        try {
            const userGoal = await userDailyGoals_1.default.findOne({ where: filter });
            await userGoal.update(update, { transaction });
            return userGoal;
        }
        catch (error) {
            //   throw errorUtilities.createError(`Error updating User: ${error.message}`, 400);
        }
    },
    deleteOne: async (filter) => {
        try {
            const userGoal = await userDailyGoals_1.default.findOne({ where: filter });
            if (!userGoal)
                throw new Error("Goal not found");
            await userGoal.destroy();
            return userGoal;
        }
        catch (error) {
            throw new Error(`Error deleting User Goal: ${error.message}`);
        }
    },
    getCount: async (filter) => {
        try {
            const { count } = await userDailyGoals_1.default.findAndCountAll({
                where: filter,
                raw: true
            });
            return count;
        }
        catch (error) {
            console.log(`Fetch Goals Count Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error fetching user goals, please try again`, 500);
        }
    },
    getOne: async (filter, projection = null) => {
        try {
            const userGoal = await userDailyGoals_1.default.findOne({
                where: filter,
                attributes: projection,
                raw: true
            });
            return userGoal;
        }
        catch (error) {
            console.log(`Fetch Goal Error: ${error.message}`);
            throw utilities_1.errorUtilities.createError(`Error fetching user goal, please try again`, 500);
        }
    },
};
exports.default = userDailyGoalRepositories;
