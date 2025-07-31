import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import Options from "../entities/option";


const optionRepositories = {
  
  getOptions: async (filter?: { questionId?: string }) => {
    try {
      const where: any = {}
      if (typeof filter?.questionId === 'string') {
        where.questionId = filter.questionId
      }

      // Pass it straight to Sequelize
      const options = await Options.findAll({ where });

      return options;
    } catch (error: any) {
        throw errorUtilities.createError(`Error Fetching options: ${error.message}`, 500);
    }
  },

  getOption: async (id: string) => {
    try {
        const option = await Options.findByPk(id);

        return option;
    } catch(error: any) {
        throw errorUtilities.createError(`Error Fetching option: ${error.message}`, 500);
    }
  },

  addOption: async (optionData: any, transaction?: Transaction) => {
    try {
      // Create a new option
      const newOption = await Options.create(optionData, { transaction });

      return newOption;

    } catch (error: any) {
      throw errorUtilities.createError(`Error Adding option: ${error.message}`, 500);
    }
  },

  updateOption: async (id: string, optionData: any) => {
    try {
      // Update the option
      await Options.update(optionData, { where: { id } });

      return optionData;

    } catch (error: any) {

      throw errorUtilities.createError(`Error Updating question: ${error.message}`, 500);
    }
  },

  deleteOption: async (id: string) => {
    try {
      await Options.destroy({ where: { id } });

      return { message: "Option deleted successfully" };

    } catch (error: any) {
      throw errorUtilities.createError(`Error Deleting option: ${error.message}`, 500);
    }
  }
}

export default optionRepositories;