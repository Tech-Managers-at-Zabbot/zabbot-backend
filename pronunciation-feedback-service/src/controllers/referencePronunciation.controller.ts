import { Request, Response } from "express";
import pronunciationService from "../services/reference-pronunciation.service";
import pronunciationFeedbackService from "../services/pronunciation-feedback.service";
import { errorUtilities, responseUtilities } from "../../../shared/utilities";

export const getRefPronunciationsController =
  errorUtilities.withControllerErrorHandling(
    async (req: Request, res: Response) => {
      const pronunciation = await pronunciationService.getPronunciations();

      return responseUtilities.responseHandler(
        // @ts-ignore
        res,
        pronunciation.message,
        pronunciation.statusCode,
        pronunciation.data
      );
    }
  );

export const getRefPronunciationController =
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

export const addRefPronunciationController =
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

export const updateRefPronunciationController =
  errorUtilities.withControllerErrorHandling(async (req: Request, res) => {
    const { id } = req.params;
    const payload = req.body;
    const content = await pronunciationService.updatePronunciation(id, payload);
    return responseUtilities.responseHandler(
      res,
      content.message,
      content.statusCode,
      content.data
    );
  });

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

export const comparePronunciation = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    if (!req.file) {
      return responseUtilities.responseHandler(
        // @ts-ignore
        res,
        "File is required",
        400,
        null
      );
    }

    const user = (req as any).user as { userId: string };
    if (!user || !user.userId) {
      return responseUtilities.responseHandler(
        // @ts-ignore
        res,
        "User not authenticated",
        400,
        null
      );
    }

    const referencePronunciationId = req.params.id;
    const { voice } = req.body;

    const pronunciation =
      await pronunciationFeedbackService.comparePronounciation({
        file: req.file,
        userId: user.userId,
        referencePronunciationId,
        voice,
      });

    return responseUtilities.responseHandler(
      // @ts-ignore
      res,
      pronunciation.message,
      pronunciation.statusCode,
      pronunciation.data
    );
  }
);
