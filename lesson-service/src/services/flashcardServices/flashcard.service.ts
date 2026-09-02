import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { v4 } from "uuid";
import flashcardRepositories from "../../repositories/flashcard.repository";
import { FlashcardResponses } from "../../responses/responses";

const createFlashcardService = errorUtilities.withServiceErrorHandling(
  async (flashcardData: Record<string, any>) => {
    const payload = {
      ...flashcardData,
      id: v4(),
      createdAt: new Date(),
    };

    const newFlashcard = await flashcardRepositories.addFlashcard(payload);
    return responseUtilities.handleServicesResponse(
      StatusCodes.Created,
      FlashcardResponses.FLASHCARD_CREATED_SUCCESSFULLY,
      newFlashcard,
    );
  },
);

const getFlashcardsService = errorUtilities.withServiceErrorHandling(
  async (filter: Record<string, any> = {}) => {
    const flashcards = await flashcardRepositories.getFlashcards(filter);
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      FlashcardResponses.SUCCESSFUL_PROCESS,
      flashcards,
    );
  },
);

const getFlashcardService = errorUtilities.withServiceErrorHandling(
  async (flashcardId: string) => {
    const flashcard = await flashcardRepositories.getFlashcard(flashcardId);
    if (!flashcard) {
      throw errorUtilities.createError(
        FlashcardResponses.FLASHCARD_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      FlashcardResponses.SUCCESSFUL_PROCESS,
      flashcard,
    );
  },
);

const updateFlashcardService = errorUtilities.withServiceErrorHandling(
  async (flashcardId: string, flashcardData: Record<string, any>) => {
    const existingFlashcard =
      await flashcardRepositories.getFlashcard(flashcardId);
    if (!existingFlashcard) {
      throw errorUtilities.createError(
        FlashcardResponses.FLASHCARD_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }

    const payload = {
      ...flashcardData,
      updatedAt: new Date(),
    };

    const updatedFlashcard = await flashcardRepositories.updateFlashcard(
      flashcardId,
      payload,
    );
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      FlashcardResponses.FLASHCARD_UPDATED_SUCCESSFULLY,
      updatedFlashcard,
    );
  },
);

const deleteFlashcardService = errorUtilities.withServiceErrorHandling(
  async (flashcardId: string) => {
    const existingFlashcard =
      await flashcardRepositories.getFlashcard(flashcardId);
    if (!existingFlashcard) {
      throw errorUtilities.createError(
        FlashcardResponses.FLASHCARD_NOT_FOUND,
        StatusCodes.NotFound,
      );
    }

    await flashcardRepositories.deleteFlashcard(flashcardId);
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      FlashcardResponses.FLASHCARD_DELETED_SUCCESSFULLY,
      null,
    );
  },
);

export default {
  createFlashcardService,
  getFlashcardsService,
  getFlashcardService,
  updateFlashcardService,
  deleteFlashcardService,
};
