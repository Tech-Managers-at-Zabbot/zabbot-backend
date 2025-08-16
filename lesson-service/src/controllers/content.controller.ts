import { Request, Response } from 'express';
import contentService from '../services/lessonServices/content.service';
import { errorUtilities, responseUtilities } from '../../../shared/utilities';

// Controller to get all contents
export const getContentsController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const contents = await contentService.getContents(payload);
    return responseUtilities.responseHandler(res, contents.message, contents.statusCode, contents.data);
  }
);

// Controller to get contents for a specific lesson
export const getLessonContentsController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { lessonId } = req.params;
    const contents = await contentService.getLessonContents(lessonId);
    return responseUtilities.responseHandler(res, contents.message, contents.statusCode, contents.data);
  }
);

export const getLanguageContentsController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { languageId } = req.params;
    const contents = await contentService.getContentsForLanguage(languageId);
    return responseUtilities.responseHandler(res, contents.message, contents.statusCode, contents.data);
  }
);

// Controller to get a single content
export const getContentController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const content = await contentService.getContent(req);
    return responseUtilities.responseHandler(res, content.message, content.statusCode, content.data);
  }
);

// Controller to create a new content
export const addContentController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const content = await contentService.addContent(payload);
    return responseUtilities.responseHandler(res, content.message, content.statusCode, content.data);
  }
);

// Controller to update an existing content
export const updateContentController = errorUtilities.withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const content = await contentService.updateContent(id, payload);
    return responseUtilities.responseHandler(res, content.message, content.statusCode, content.data);
  }
);

export const addContentFileController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const contentFileDetails = await contentService.addContentFile(request.body);
    return responseUtilities.responseHandler(response, contentFileDetails.message, contentFileDetails.statusCode, contentFileDetails.data);
  }
);