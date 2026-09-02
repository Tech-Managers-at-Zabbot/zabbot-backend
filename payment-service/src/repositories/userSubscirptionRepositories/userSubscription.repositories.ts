import { Transaction } from "sequelize";
import { errorUtilities } from "../../../../shared/utilities";
import UserSubscription from "../../../../shared/entities/payment-service-entities/subscriptions/userSubscriptions";

const userSubscriptionRepositories = {
  create: async (data: any, transaction?: Transaction) => {
    try {
      const newUSerSubscription = await UserSubscription.create(data, { transaction });
      return newUSerSubscription;
    } catch (error: any) {
      console.log(`Create User Subscription Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error creating User Subscription, please try again`,
        500
      );
    }
  },

  getByPK: async (id: string) => {
    try {
      const userSub = await UserSubscription.findByPk(id);
      return userSub;
    } catch (error: any) {
      console.log(`Fetch User Subscription Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error Fetching User Subscription, please try again`,
        500
      );
    }
  },

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const userSub: any = await UserSubscription.findOne({ where: filter });
      await userSub.update(update, { transaction });
      return userSub;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error updating User Subscription: ${error.message}`,
        400
      );
    }
  },

  updateMany: async (filter: any, update: any) => {
    try {
      const [affectedRows] = await UserSubscription.update(update, {
        where: filter,
      });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error updating User Subscription: ${error.message}`);
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const userSub = await UserSubscription.findOne({ where: filter });
      if (!userSub) throw new Error("User Subscription not found");
      await userSub.destroy();
      return userSub;
    } catch (error: any) {
      throw new Error(`Error deleting User Subscription: ${error.message}`);
    }
  },

  deleteMany: async (filter: any) => {
    try {
      const affectedRows = await UserSubscription.destroy({ where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error deleting User Subscription: ${error.message}`);
    }
  },

  getOne: async (filter: Record<string, any>, projection: any = null, order?:any) => {
    try {
      const userSub = await UserSubscription.findOne({
        where: filter,
        attributes: projection,
        order,
        raw: true,
      });
      return userSub;
    } catch (error: any) {
      console.log(`Fetch User Subscription Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error fetching User Subscription, please try again`,
        500
      );
    }
  },

  getAllCount: async () => {
    try {
      const { count } = await UserSubscription.findAndCountAll({});
      return count;
    } catch (error: any) {
      console.log(`Count User Subscription error: ${error.message}`);
    }
  },

  getMany: async (
    filter: any,
    projection?: any,
    options?: any,
    order?: any
  ) => {
    try {
      const userSubscription = await UserSubscription.findAll({
        where: filter,
        attributes: projection,
        ...options,
        order,
        raw: true,
      });
      return userSubscription;
    } catch (error: any) {
      throw new Error(`Error fetching User Subscriptions: ${error.message}`);
    }
  },
};

export default userSubscriptionRepositories;
