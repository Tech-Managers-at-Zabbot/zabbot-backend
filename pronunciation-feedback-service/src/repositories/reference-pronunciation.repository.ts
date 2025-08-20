import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import ReferencePronunciation from "../../../shared/entities/pronunciation-feedback-service-entities/referencePronunciation/reference-pronunciation";

const referenePronunciationRepositories = {
  getPronunciation: async (
    id: string
  ): Promise<ReferencePronunciation | null> => {
    try {
      const pronunciation = await ReferencePronunciation.findByPk(id);

      return pronunciation;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching pronunciation: ${error.message}`,
        500
      );
    }
  },

  getPronunciationByEnglishWord: async (englishWord: string) => {
    try {
      const pronunciation = await ReferencePronunciation.findOne({
        where: { englishWord },
      });

      return pronunciation;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Fetching pronunciation by englishWord: ${error.message}`,
        500
      );
    }
  },

  getPronunciations: async () => {
    try {
      const pronunciations = await ReferencePronunciation.findAll();
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
      // Create a new pronunciation
      const newPronunciation = await ReferencePronunciation.create(
        pronunciationData,
        { transaction }
      );

      return newPronunciation;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error Adding pronunciation: ${error.message}`,
        500
      );
    }
  },

  updatePronunciation: async (
    pronunciationData: any,
    updateFilter: Record<string, any>
  ) => {
    try {
      await ReferencePronunciation.update(
        pronunciationData,
        { where: updateFilter }
      );

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
      await ReferencePronunciation.destroy({
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

export default referenePronunciationRepositories;
