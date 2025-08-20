import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import UserDailyGoals from "../../../shared/entities/lesson-service-entities/userDailyGoals/userDailyGoals";

const userDailyGoalRepositories = {

  create: async (data: any, transaction?: Transaction) => {
    try {
      const newUserGoal = await UserDailyGoals.create(data, { transaction });
      return newUserGoal;
    } catch (error: any) {
      console.log(`Create Daily Goal Error: ${error.message}`)
      throw errorUtilities.createError(`Error updating daily goal, please try again`, 500);
    }
  },

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const userGoal: any = await UserDailyGoals.findOne({ where: filter });
      await userGoal.update(update, { transaction });
      return userGoal;
    } catch (error: any) {
    //   throw errorUtilities.createError(`Error updating User: ${error.message}`, 400);
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const userGoal = await UserDailyGoals.findOne({ where: filter });
      if (!userGoal) throw new Error("Goal not found");
      await userGoal.destroy();
      return userGoal;
    } catch (error: any) {
      throw new Error(`Error deleting User Goal: ${error.message}`);
    }
  },

  getCount: async (filter: Record<string, any>) => {
    try {
      const { count } = await UserDailyGoals.findAndCountAll({
        where: filter,
        raw: true
      });
      return count;
    } catch (error: any) {
      console.log(`Fetch Goals Count Error: ${error.message}`)
      throw errorUtilities.createError(`Error fetching user goals, please try again`, 500);
    }
  },

  getOne: async (filter: Record<string, any>, projection: any = null) => {
    try {
      const userGoal = await UserDailyGoals.findOne({
        where: filter,
        attributes: projection,
        raw: true
      });
      return userGoal;
    } catch (error: any) {
      console.log(`Fetch Goal Error: ${error.message}`)
      throw errorUtilities.createError(`Error fetching user goal, please try again`, 500);
    }
  },
};

export default userDailyGoalRepositories
