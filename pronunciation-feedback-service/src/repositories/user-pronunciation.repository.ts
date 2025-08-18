import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import UserPronunciation from "../../../shared/entities/pronunciation-feedback-service-entities/userPronunciation/user-pronunciation";

const userPronunciationRepositories = {
  getPronunciation: async (id: string) => {
    try {
      const pronunciation = await UserPronunciation.findByPk(id);

      return pronunciation;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching pronunciation: ${error.message}`,
        500
      );
    }
  },

  getPronunciations: async () => {
    try {
      const pronunciations = await UserPronunciation.findAll();
      return pronunciations;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching pronunciations: ${error.message}`,
        500
      );
    }
  },

  addPronunciation: async (
    pronunciationData: any,
    transaction?: Transaction
  ) => {
    try {
      // check if pronunciation already exists
      const existingPronunciation = await UserPronunciation.findOne({
        where: {
          userId: pronunciationData.userId,
          pronunciationId: pronunciationData.pronunciationId,
        },
        transaction,
      });
      if (existingPronunciation) {
        existingPronunciation.update(pronunciationData, { transaction });
        return existingPronunciation;
      } else {
        // Create a new pronunciation
        const newPronunciation = await UserPronunciation.create(
          pronunciationData,
          { transaction }
        );

        return newPronunciation;
      }
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Adding pronunciation: ${error.message}`,
        500
      );
    }
  },

  updatePronunciation: async (
    pronunciationData: any,
    transaction?: Transaction
  ) => {
    try {
      await pronunciationData.update(pronunciationData, { transaction });

      return pronunciationData;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Updating pronunciation: ${error.message}`,
        500
      );
    }
  },

  deletePronunciation: async (id: string, transaction?: Transaction) => {
    try {
      await UserPronunciation.destroy({
        where: { id },
        transaction,
      });

      return { message: "Pronunciation deleted successfully" };
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Deleting pronunciation: ${error.message}`,
        500
      );
    }
  },
};

export default userPronunciationRepositories;
