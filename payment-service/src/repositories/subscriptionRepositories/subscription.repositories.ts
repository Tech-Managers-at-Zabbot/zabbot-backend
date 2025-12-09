import { Transaction } from "sequelize";
import { errorUtilities } from "../../../../shared/utilities";
import SubscriptionPlan from "../../../../shared/entities/payment-service-entities/subscriptions/subscriptions";

const subscriptionPlanRepositories = {
  create: async (data: any, transaction?: Transaction) => {
    try {
      const newSubscriptionPlan = await SubscriptionPlan.create(data, { transaction });
      return newSubscriptionPlan;
    } catch (error: any) {
      console.log(`Create Subscription Plan Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error creating Subscription Plan, please try again`,
        500
      );
    }
  },

  getByPK: async (id: string) => {
    try {
      const subPlan = await SubscriptionPlan.findByPk(id);
      return subPlan;
    } catch (error: any) {
      console.log(`Fetch Subscription Plan Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error Fetching Subscription Plan, please try again`,
        500
      );
    }
  },

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const subPlan: any = await SubscriptionPlan.findOne({ where: filter });
      await subPlan.update(update, { transaction });
      return subPlan;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error updating Subscription Plan: ${error.message}`,
        400
      );
    }
  },

  updateMany: async (filter: any, update: any) => {
    try {
      const [affectedRows] = await SubscriptionPlan.update(update, {
        where: filter,
      });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error updating Subscription Plan: ${error.message}`);
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const subPlan = await SubscriptionPlan.findOne({ where: filter });
      if (!subPlan) throw new Error("Subscription Plan not found");
      await subPlan.destroy();
      return subPlan;
    } catch (error: any) {
      throw new Error(`Error deleting Subscription Plan: ${error.message}`);
    }
  },

  deleteMany: async (filter: any) => {
    try {
      const affectedRows = await SubscriptionPlan.destroy({ where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error deleting Subscription Plan: ${error.message}`);
    }
  },

  getOne: async (filter: Record<string, any>, projection: any = null, order?:any) => {
    try {
      const subPlan = await SubscriptionPlan.findOne({
        where: filter,
        attributes: projection,
        order,
        raw: true,
      });
      return subPlan;
    } catch (error: any) {
      console.log(`Fetch Subscription Plan Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error fetching Subscription Plan, please try again`,
        500
      );
    }
  },

  getAllCount: async () => {
    try {
      const { count } = await SubscriptionPlan.findAndCountAll({});
      return count;
    } catch (error: any) {
      console.log(`Count Subscription Plan error: ${error.message}`);
    }
  },

  getMany: async (
    filter: any,
    projection?: any,
    options?: any,
    order?: any
  ) => {
    try {
      const subPlan = await SubscriptionPlan.findAll({
        where: filter,
        attributes: projection,
        ...options,
        order,
        raw: true,
      });
      return subPlan;
    } catch (error: any) {
      throw new Error(`Error fetching Subscription Plans: ${error.message}`);
    }
  },
};

export default subscriptionPlanRepositories;
