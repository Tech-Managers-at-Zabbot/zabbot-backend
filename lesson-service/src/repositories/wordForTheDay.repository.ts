import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import WordForTheDay from "../entities/wordForTheDay";

const wordForTheDayRepositories = {

  create: async (data: any, transaction?: Transaction) => {
    try {
      const newWordForTheDay = await WordForTheDay.create(data, { transaction });
      return newWordForTheDay;
    } catch (error: any) {
      console.log(`Create Daily Word Error: ${error.message}`)
      throw errorUtilities.createError(`Error creating daily word, please try again`, 500);
    }
  },

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const dailyWOrd: any = await WordForTheDay.findOne({ where: filter });
      await dailyWOrd.update(update, { transaction });
      return dailyWOrd;
    } catch (error: any) {
      throw errorUtilities.createError(`Error updating Daily Word: ${error.message}`, 400);
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const dailyWOrd = await WordForTheDay.findOne({ where: filter });
      if (!dailyWOrd) throw new Error("Word not found");
      await dailyWOrd.destroy();
      return dailyWOrd;
    } catch (error: any) {
      throw new Error(`Error deleting daily word: ${error.message}`);
    }
  },

  getOne: async (filter: Record<string, any>, projection: any = null) => {
    try {

      const dailyWord = await WordForTheDay.findOne({
        where: filter,
        attributes: projection,
        raw: true
      });
      return dailyWord;
    } catch (error: any) {
      console.log(`Fetch Daily Word Error: ${error.message}`)
      throw errorUtilities.createError(`Error fetching daily word, please try again`, 500);
    }
  },

  getOneOldWord: async (filter: Record<string, any>, projection: any = null) => {
    try {
      let orderBy: [string, string][];

      if (filter.dateUsed === null) {
        orderBy = [['createdAt', 'ASC']];
      } else {
        orderBy = [['dateUsed', 'ASC']];
      }

      const oldWord = await WordForTheDay.findOne({
        where: filter,
        attributes: projection,
        order: orderBy,
        raw: true
      });
      return oldWord;
    } catch (error: any) {
      console.log(`Fetch Old Daily Word Error: ${error.message}`)
      throw errorUtilities.createError(`Error fetching old daily word, please try again`, 500);
    }
  },
};

export default wordForTheDayRepositories;