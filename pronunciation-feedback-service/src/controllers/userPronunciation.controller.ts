import { Request } from "express";
import pronunciationService from "../services/user-pronunciation.service";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";

export const getPronunciationsController =
  errorUtilities.withControllerErrorHandling(async (req: Request, res) => {
    const user = (req as Request & { user?: { userId?: string; role?: string } }).user;
    const pronunciation = await pronunciationService.getPronunciations(
      user?.role === "admin" ? undefined : user?.userId,
    );

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
    const user = (req as Request & { user?: { userId?: string; role?: string } }).user;
    const pronunciation = await pronunciationService.getPronunciation(
      id, user?.role === "admin" ? undefined : user?.userId,
    );
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
