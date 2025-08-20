import { Request } from "express";
import pronunciationService from "../services/user-pronunciation.service";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";

export const getPronunciationsController =
  errorUtilities.withControllerErrorHandling(async (req: Request, res) => {
    const pronunciation = await pronunciationService.getPronunciations();

    return responseUtilities.responseHandler(
      res,
      pronunciation.message,
      pronunciation.statusCode,
      pronunciation.data
    );
  });

export const getPronunciationController =
  errorUtilities.withControllerErrorHandling(async (req: Request, res) => {
    const { id } = req.params;
    const pronunciation = await pronunciationService.getPronunciation(id);
    return responseUtilities.responseHandler(
      res,
      pronunciation.message,
      pronunciation.statusCode,
      pronunciation.data
    );
  });

export const addPronunciationController =
  errorUtilities.withControllerErrorHandling(async (req: Request, res) => {
    const payload = req.body;
    const pronunciation = await pronunciationService.addPronunciation(payload);
    return responseUtilities.responseHandler(
      res,
      pronunciation.message,
      pronunciation.statusCode,
      pronunciation.data
    );
  });

export const updatePronunciation = errorUtilities.withControllerErrorHandling(
  async (req: Request, res) => {
    const { id } = req.params;
    const payload = req.body;
    const content = await pronunciationService.updatePronunciation(id, payload);
    return responseUtilities.responseHandler(
      res,
      content.message,
      content.statusCode,
      content.data
    );
  }
);

export const deletePronunciation = errorUtilities.withControllerErrorHandling(
  async (req: Request, res) => {
    const { id } = req.params;
    const content = await pronunciationService.deletePronunciation(id);
    return responseUtilities.responseHandler(
      res,
      content.message,
      content.statusCode,
      content.data
    );
  }
);
