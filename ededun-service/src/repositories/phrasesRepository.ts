import { Transaction } from "sequelize";
import Phrases from "../models/phrases/phrasesModel";

const phrasesRepository = {

  create: async (data: any, transaction?:Transaction) => {
    try {
      const newPhrases = await Phrases.create(data, { transaction });
      return newPhrases;
    } catch (error: any) {
      throw new Error(`Error creating Phrases: ${error.message}`);
    }
  },

  updateOne: async (filter: any, update: any, transaction?: Transaction) => {
    try {
      const phrase:any = await Phrases.findOne({ where: filter });
      await phrase.update(update, { transaction });
      return phrase;
    } catch (error: any) {
      throw new Error(`Error updating Phrases: ${error.message}`);
    }
  },
  

  updateMany: async (filter: any, update: any) => {
    try {
      const [affectedRows] = await Phrases.update(update, { where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error updating Phrases: ${error.message}`);
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const phrase = await Phrases.findOne({ where: filter });
      if (!phrase) throw new Error("Phrase not found");
      await phrase.destroy();
      return phrase;
    } catch (error: any) {
      throw new Error(`Error deleting Phrases: ${error.message}`);
    }
  },

  deleteMany: async (filter: any) => {
    try {
      const affectedRows = await Phrases.destroy({ where: filter });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error deleting Phrases: ${error.message}`);
    }
  },

  getOne: async (filter: Record<string, any>, projection: any = null) => {
    try {
      const phrase = await Phrases.findOne({
        where: filter,
        attributes: projection
      });
      return phrase;
    } catch (error: any) {
      throw new Error(`Error fetching Phrases: ${error.message}`);
    }
  },
  

  getMany: async (filter: any, projection?: any, options?: any, order?:any) => {
    try {
      const phrases = await Phrases.findAll({
        where: filter,
        attributes: projection,
        ...options,
        order
      });
      return phrases;
    } catch (error: any) {
      throw new Error(`Error fetching Phrases: ${error.message}`);
    }
  },
  
};

export default {
  phrasesRepository,
};
