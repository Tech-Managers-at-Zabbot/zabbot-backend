import { Transaction } from "sequelize";
import { errorUtilities } from "../../../shared/utilities";
import Flashcards from "../../../shared/entities/lesson-service-entities/flashcard/flashcard";

const flashcardRepositories = {
  getFlashcards: async (filter: Record<string, any> = {}) => {
    try {
      const flashcards = await Flashcards.findAll({
        where: filter,
        raw: true,
        order: [["createdAt", "ASC"]],
      });

      return flashcards;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching flashcards: ${error.message}`,
        500,
      );
    }
  },

  getFlashcard: async (id: string) => {
    try {
      const flashcard = await Flashcards.findByPk(id);

      return flashcard;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error fetching flashcard: ${error.message}`,
        500,
      );
    }
  },

  addFlashcard: async (
    flashcardData: Record<string, any> | any,
    transaction?: Transaction,
  ) => {
    try {
      const newFlashcard = await Flashcards.create(flashcardData, {
        transaction,
      });

      return newFlashcard;
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error adding flashcard: ${error.message}`,
        500,
      );
    }
  },

  updateFlashcard: async (
    id: string,
    flashcardData: Record<string, any>,
    transaction?: Transaction,
  ) => {
    try {
      const [updatedCount, updatedFlashcards] = await Flashcards.update(
        flashcardData,
        {
          where: { id },
          returning: true,
          transaction,
        },
      );

      if (updatedCount === 0) {
        throw errorUtilities.createError(
          "Flashcard not found or no changes applied",
          404,
        );
      }

      return updatedFlashcards[0];
    } catch (error: any) {
      if (error?.statusCode) {
        throw error;
      }
      throw errorUtilities.createError(
        `Error updating flashcard: ${error.message}`,
        500,
      );
    }
  },

  deleteFlashcard: async (id: string, transaction?: Transaction) => {
    try {
      await Flashcards.destroy({ where: { id }, transaction });

      return { message: "Flashcard deleted successfully" };
    } catch (error: any) {
      throw errorUtilities.createError(
        `Error deleting flashcard: ${error.message}`,
        500,
      );
    }
  },
};

export default flashcardRepositories;
