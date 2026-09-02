import NewsletterSubscription from "../../../../shared/entities/user-service-entities/newsletterSubscriptions/newsletterSubscriptions.entities";
import { Transaction } from "sequelize";
import { errorUtilities } from "../../../../shared/utilities";

const newsletterRepositories = {
  create: async (data: any, transaction?: Transaction) => {
    try {
      const newRecord = await NewsletterSubscription.create(data, {
        transaction,
      });
      return newRecord;
    } catch (error: any) {
      console.log(error);
      console.log(`Create Newsletter Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error creating newsletter subscription, please try again`,
        500,
      );
    }
  },

  getByPK: async (id: string) => {
    try {
      const rec = await NewsletterSubscription.findByPk(id);
      return rec;
    } catch (error: any) {
      console.log(`Fetch Newsletter by PK Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error fetching subscription, please try again`,
        500,
      );
    }
  },

  getOne: async (filter: any, projection: any = null) => {
    try {
      const rec = await NewsletterSubscription.findOne({
        where: filter,
        attributes: projection,
        raw: true,
      });
      return rec;
    } catch (error: any) {
      console.log(`Fetch Newsletter Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error fetching subscription: ${error.message}`,
        500,
      );
    }
  },

  getMany: async (
    filter: any = {},
    projection: any = null,
    options: any = {},
    order: any = [],
  ) => {
    try {
      const recs = await NewsletterSubscription.findAll({
        where: filter,
        attributes: projection,
        ...options,
        order,
        raw: true,
      });
      return recs;
    } catch (error: any) {
      console.log(`Fetch Newsletters Error: ${error.message}`);
      throw errorUtilities.createError(
        `Error fetching subscriptions: ${error.message}`,
        500,
      );
    }
  },

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const rec: any = await NewsletterSubscription.findOne({ where: filter });
      if (!rec) throw errorUtilities.createError("Subscription not found", 404);
      await rec.update(update, { transaction });
      return rec;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error updating subscription: ${error.message}`,
        400,
      );
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const rec = await NewsletterSubscription.findOne({ where: filter });
      if (!rec) throw errorUtilities.createError("Subscription not found", 404);
      await rec.destroy();
      return rec;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error deleting subscription: ${error.message}`,
        400,
      );
    }
  },
};

export default newsletterRepositories;
