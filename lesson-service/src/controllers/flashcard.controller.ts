import { Request, Response } from "express";
import { Op } from "sequelize";
import { FlashcardPreviewRequest } from "../../../shared/subscription-gating/flashcardPreview";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";
import flashcardService from "../services/flashcardServices/flashcard.service";

const addFlashcardController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const payload = request.body;
    const flashcard =
      await flashcardService.createFlashcardService(payload);
    return responseUtilities.responseHandler(
      response,
      flashcard.message,
      flashcard.statusCode,
      flashcard.data,
    );
  },
);

const getFlashcardsController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { language } = request.query;
    const filter: Record<string, unknown> = language ? { language } : {};
    const previewIds = (request as FlashcardPreviewRequest).flashcardPreviewIds;
    if (previewIds) filter.id = { [Op.in]: previewIds };
    const flashcards = await flashcardService.getFlashcardsService(filter);
    return responseUtilities.responseHandler(
      response,
      flashcards.message,
      flashcards.statusCode,
      flashcards.data,
    );
  },
);

const getFlashcardController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { id } = request.params;
    const flashcard = await flashcardService.getFlashcardService(id);
    return responseUtilities.responseHandler(
      response,
      flashcard.message,
      flashcard.statusCode,
      flashcard.data,
    );
  },
);

const updateFlashcardController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { id } = request.params;
    const payload = request.body;
    const flashcard = await flashcardService.updateFlashcardService(
      id,
      payload,
    );
    return responseUtilities.responseHandler(
      response,
      flashcard.message,
      flashcard.statusCode,
      flashcard.data,
    );
  },
);

const deleteFlashcardController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { id } = request.params;
    const flashcard = await flashcardService.deleteFlashcardService(id);
    return responseUtilities.responseHandler(
      response,
      flashcard.message,
      flashcard.statusCode,
      flashcard.data,
    );
  },
);

export default {
  addFlashcardController,
  getFlashcardsController,
  getFlashcardController,
  updateFlashcardController,
  deleteFlashcardController,
};
